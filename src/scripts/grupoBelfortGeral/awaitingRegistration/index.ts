import Conversations from '@models/Conversations';
import ConversationsService from '@services/conversationService';
import CollaboratorService from '@services/collaboratorService';
import HistoricService from '@services/historicService';
import SarService from '@services/sarService';
import { ReturnScript } from 'src/scripts/interfaces';

import CollaboratorCache from '@cache/collaboratorCache';

// Script: Authentication Collaborators
import Client from '@models/Client';
import company from './01.company';
import re from './02.re';
import documentConfirmation from './03.documentConfirmation';
import email from './04.email';

class AwaitingRegistration {
  private readonly sarService: SarService = new SarService();

  private readonly collaboratorService: CollaboratorService = new CollaboratorService();

  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly historicService: HistoricService = new HistoricService();

  private readonly client: Client;

  private readonly from: string;

  private readonly message: string;

  private readonly service: string;

  constructor(client: Client, from: string, message: string, service: string) {
    this.client = client;
    this.from = from;
    this.message = message;
    this.service = service;
  }

  public async chat(conversation: Conversations): Promise<ReturnScript> {
    let historic = await this.historicService.sequenceStatus(conversation);

    if (!historic) {
      historic = await this.historicService.execute(
        conversation,
        1,
        'name',
        '',
      );
    }

    switch (historic.sequence) {
      case 1:
        const companyScript = await company(conversation, this.message);
        if (companyScript.status) {
          historic.response = companyScript.data;

          await this.historicService.update(historic);

          historic = await this.historicService.execute(
            conversation,
            2,
            're',
            're',
          );
        }

        return { message: companyScript.message };

      case 2:
        if (historic.response === 're') {
          const companyId = await this.historicService.findSequence(
            conversation,
            1,
          );

          if (companyId) {
            let reScript;
            if (this.service === 'whatsapp') {
              reScript = await re(
                conversation,
                this.message,
                parseInt(companyId.response, 10),
                this.from,
              );
            } else {
              reScript = await re(
                conversation,
                this.message,
                parseInt(companyId.response, 10),
              );
            }

            if (reScript.status) {
              const [reNumber, docConfirmation] = reScript.data.split('|');

              historic.response = reNumber;
              await this.historicService.update(historic);

              await this.historicService.execute(
                conversation,
                3,
                'document',
                docConfirmation,
              );
              return {
                message: reScript.message,
                end: reScript.end,
              };
            }
            historic.response = '';
            await this.historicService.update(historic);
            return { message: reScript.message };
          }

          return {
            message:
              '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
            end: true,
          };
        }
        switch (this.message) {
          case '1':
            await this.historicService.delete(historic);
            const companies = await this.sarService.findAllCompanies([
              10001,
              10004,
              10007,
              10016,
            ]);

            if (!companies) {
              return {
                message:
                  '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
                end: true,
              };
            }
            return {
              message: companies.reduce((previous, currentValue) => {
                return previous.concat(
                  `\n*${currentValue.sequence}* - ${currentValue.name}`,
                );
              }, '➡️ Selecione a sua *EMPRESA*:\n'),
            };
          default:
            const companyId = await this.historicService.findSequence(
              conversation,
              1,
            );

            if (companyId) {
              let reScript;
              if (this.service === 'whatsapp') {
                reScript = await re(
                  conversation,
                  this.message,
                  parseInt(companyId.response, 10),
                  this.from,
                );
              } else {
                reScript = await re(
                  conversation,
                  this.message,
                  parseInt(companyId.response, 10),
                );
              }

              if (reScript.status) {
                const [reNumber, docConfirmation] = reScript.data.split('|');

                historic.response = reNumber;
                await this.historicService.update(historic);

                await this.historicService.execute(
                  conversation,
                  3,
                  'document',
                  docConfirmation,
                );
                return {
                  message: reScript.message,
                  end: reScript.end,
                };
              }
              return { message: reScript.message };
            }

            return {
              message:
                '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
              end: true,
            };
        }

      case 3:
        const documentConfirmationScript = await documentConfirmation(
          historic.response,
          this.message,
        );
        if (documentConfirmationScript.status) {
          historic.response = 'confirmed';
          await this.historicService.update(historic);

          historic = await this.historicService.execute(
            conversation,
            4,
            'email',
            '',
          );
          return {
            message: documentConfirmationScript.message,
          };
        }

        const [type, document] = historic.response.split(':');

        historic.response = `${type}:${document}:${documentConfirmationScript.data}`;
        await this.historicService.update(historic);

        return {
          message: documentConfirmationScript.message,
          end: documentConfirmationScript.end,
        };

      case 4:
        const collaborator = CollaboratorCache.get(conversation.id);
        let newConversation;
        let newcollaborator;

        if (historic.response === 'optant') {
          const emailScript = await email(this.message);

          if (emailScript.status) {
            collaborator.email = this.message.toLocaleLowerCase();
            newcollaborator = await this.collaboratorService.execute(
              collaborator,
            );

            historic.response = collaborator.email;
            await this.historicService.update(historic);

            conversation.collaborator = newcollaborator;
            conversation.name = 'collaborator_registration';
            conversation.close = true;
            await this.conversationsService.update(conversation);

            newConversation = await this.conversationsService.execute(
              this.client,
              this.from,
              false,
            );

            newConversation.collaborator = newcollaborator;
            await this.conversationsService.update(newConversation);

            return { message: emailScript.message };
          }
          return { message: emailScript.message };
        }

        switch (this.message) {
          case '1':
            historic.response = 'optant';
            await this.historicService.update(historic);
            return {
              message: [
                '🚨 Fique tranquilo, não praticamos o envio de *SPAMS*.',
                '➡️ Agora nos informe o seu e-mail!.',
              ],
            };

          case '2':
            historic.response = 'not opting';
            await this.historicService.update(historic);
            newcollaborator = await this.collaboratorService.execute(
              collaborator,
            );

            conversation.name = 'collaborator_registration';
            conversation.collaborator = newcollaborator;
            conversation.close = true;
            await this.conversationsService.update(conversation);

            newConversation = await this.conversationsService.execute(
              this.client,
              this.from,
              false,
            );

            newConversation.collaborator = newcollaborator;
            await this.conversationsService.update(newConversation);

            return {
              message: [
                '✅ Seu cadastro foi realizado!',
                'Este é o menu exclusivo para os colaboradores do *GRUPO BELFORT*!',
                'Escolha uma das opções abaixo:\n\n' +
                  '*1.* Indicação de cliente\n' +
                  '*2.* Indicação de colaborador\n' +
                  '*3.* Demais informações\n' +
                  '*4.* Encerrar atendimento',
              ],
            };

          default:
            return {
              message:
                '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
              end: true,
            };
        }

      default:
        return {
          message:
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          end: true,
        };
    }
  }
}

export default AwaitingRegistration;
