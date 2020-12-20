import AuthenticationCollaborators from './authenticationCollaborators';
import Conversation from '../models/Conversations';

import ConversationsService from '../services/ConversationService';
import CollaboratorService from '../services/CollaboratorService';
import BelfortService from '../services/BelfortService';
import { ReturnScript } from './interfaces';
import HistoricService from '../services/HistoricService';
import CustomerIndication from './customerIndication';

class ConversationManager {
  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly collaboratorService: CollaboratorService = new CollaboratorService();

  private readonly belfortService: BelfortService = new BelfortService();

  private readonly historicService: HistoricService = new HistoricService();

  private readonly from: string;

  private readonly message: string;

  private readonly timestamp: number;

  private readonly source: string;

  constructor(
    from: string,
    message: string,
    timestamp: number,
    source: string,
  ) {
    this.from = from;
    this.message = message;
    this.timestamp = timestamp;
    this.source = source;
  }

  public async init(): Promise<ReturnScript> {
    let collaborator;
    switch (this.source) {
      case 'whatsapp':
        const [cell_phone] = this.from.split('@');

        const collaboratorBlocked = await this.collaboratorService.findCollaboratorByCellPhoneBlocked(
          cell_phone,
        );

        if (collaboratorBlocked) {
          return {
            status: false,
            message:
              `🚫 O seu cadastro encontra-se bloqueado em nossa plataforma!\n\n` +
              `Entre em contato com a nossa central de atendimento.`,
            end: true,
          };
        }

        collaborator = await this.collaboratorService.findCollaboratorByCellPhone(
          cell_phone,
        );

        if (collaborator) {
          const collaboratorOff = await this.belfortService.findCollaboratorByReAndCompany(
            collaborator.re,
            collaborator.company,
          );

          if (!collaboratorOff.status) {
            collaborator.is_enable = 'blocked';

            await this.collaboratorService.update(collaborator);

            return {
              status: false,
              message:
                `🚫 O seu cadastro encontra-se bloqueado em nossa plataforma!\n\n` +
                `Entre em contato com a nossa central de atendimento.`,
              end: true,
            };
          }
        }

        if (!collaborator) {
          await this.conversationsService.execute(cell_phone, 'open');
        }

        break;

      default:
        break;
    }

    if (collaborator) {
      const authentication = await this.conversationsService.findAuthenticationByCollaborator(
        collaborator,
        this.timestamp,
      );

      if (authentication) {
        const conversation = await this.conversationsService.execute(
          collaborator.cell_phone,
          'open',
          'authenticated',
        );
        conversation.collaborator = collaborator;
        await this.conversationsService.update(conversation);

        const [name] = collaborator.name.split(' ');

        return {
          start: true,
          message:
            `✌ Olá *${name}*, você está logado no menu exclusivo para os colaboradores do *GRUPO BELFORT*! \n\n` +
            'Escolha uma das opções abaixo:\n\n' +
            '*1.* Indicação de cliente\n' +
            '*2.* Demais informações\n' +
            '*3.* Encerrar atendimento',
        };
      }
      await this.conversationsService.execute(collaborator.cell_phone, 'open');
    }

    return {
      start: true,
      message:
        '🙋🏼‍♀️ Olá, meu nome é *Lili* e faço parte do atendimento virtual do *GRUPO BELFORT*. Seja bem vindo!\n\n' +
        'Este canal é exclusivo para o atendimento dos nossos *colaboradores*.\n\n' +
        'Para começar, escolha uma das opções abaixo:\n\n' +
        '*1.* Sou colaborador (a)\n' +
        '*2.* Demais informações\n' +
        '*3.* Encerrar atendimento',
    };
  }

  public async menu(conversation: Conversation): Promise<ReturnScript> {
    switch (this.message) {
      case '1':
        const authenticationCollaborators = new AuthenticationCollaborators(
          this.from,
          this.message,
          this.source,
        );

        return authenticationCollaborators.chat(conversation);

      case '2':
        conversation.name = 'demais_informacoes';
        await this.conversationsService.update(conversation);
        return {
          message: [
            'Para demais informações, entre em contato conosco através ' +
              'dos seguintes canais de atendimento:\n\n' +
              '*Para informações comerciais:*\ncomercial@belfort.com.br\n(11) 3723-2029\n\n' +
              '*Central de Atendimento ao Colaborador:*\ncolaborador@belfort.com.br\n(11) 3723-2011\n\n' +
              '*Para informações gerais:*\nrelacionamento@belfort.com.br\n(11) 3723-2020\n\n',
            'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
          ],
          finish: true,
        };

      case '3':
        conversation.name = 'sem_atendimento';
        await this.conversationsService.update(conversation);
        return {
          end: true,
        };

      default:
        return {
          message:
            '😕 Hum, infelizmente não encontramos a opção informada, ' +
            'por favor tente novamente\n\n' +
            'Para começar, escolha uma das opções abaixo:\n\n' +
            '*1.* Sou colaborador (a)\n' +
            '*2.* Demais informações\n' +
            '*3.* Encerrar atendimento',
        };
    }
  }

  public async continue(conversation: Conversation): Promise<ReturnScript> {
    const [nameScript, nameConversation] = conversation.name.split('@');

    switch (nameScript) {
      case 'awaiting authentication':
        const authenticationCollaborators = new AuthenticationCollaborators(
          this.from,
          this.message,
          this.source,
        );

        const authenticationCollaboratorsScript = await authenticationCollaborators.chat(
          conversation,
        );

        if (authenticationCollaboratorsScript.status) {
          conversation.name = 'authenticated';
          await this.conversationsService.update(conversation);

          return authenticationCollaboratorsScript;
        }

        return authenticationCollaboratorsScript;

      case 'authenticated':
        switch (this.message) {
          case '1':
            conversation.name = 'indicacao_cliente';
            await this.conversationsService.update(conversation);

            await this.historicService.execute(conversation.id, 1, 'name', '');

            return {
              message: [
                '➡️ Para começar, preciso que nos informe o *nome do cliente*',
                'O *nome do cliente* deverá conter apenas *letras*,\n*numeros* e *espaço* com no mínimo 5 caracteres.',
              ],
            };
          case '2':
            conversation.name = 'demais_informacoes';
            await this.conversationsService.update(conversation);
            return {
              message: [
                'Para demais informações, entre em contato conosco através ' +
                  'dos seguintes canais de atendimento:\n\n' +
                  '*Para informações comerciais:*\ncomercial@belfort.com.br\n(11) 3723-2029\n\n' +
                  '*Central de Atendimento ao Colaborador:*\ncolaborador@belfort.com.br\n(11) 3723-2011\n\n' +
                  '*Para informações gerais:*\nrelacionamento@belfort.com.br\n(11) 3723-2020\n\n',
                'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
              ],
              finish: true,
            };
          case '3':
            conversation.name = 'sem_atendimento';
            await this.conversationsService.update(conversation);
            return {
              end: true,
            };

          default:
            return {
              message:
                '😕 Hum, infelizmente não encontramos a opção informada, ' +
                'por favor tente novamente\n\n' +
                'Escolha uma das opções abaixo:\n\n' +
                '*1.* Indicação de cliente\n' +
                '*2.* Demais informações\n' +
                '*3.* Encerrar atendimento',
            };
        }

      case 'indicacao_cliente':
        const customerIndication = new CustomerIndication(
          this.from,
          this.message,
          this.source,
        );

        const chat = await customerIndication.chat(conversation);
        return chat;
      case 'finalizar':
        switch (this.message) {
          case '1':
            conversation.name = nameConversation;
            conversation.status = 'close';
            await this.conversationsService.update(conversation);

            const collaborator = await this.collaboratorService.findCollaboratorByCellPhone(
              conversation.cell_phone,
            );

            if (collaborator) {
              const authentication = await this.conversationsService.findAuthenticationByCollaborator(
                collaborator,
                this.timestamp,
              );

              if (authentication) {
                conversation = await this.conversationsService.execute(
                  collaborator.cell_phone,
                  'open',
                  'authenticated',
                );
                conversation.collaborator = collaborator;
                await this.conversationsService.update(conversation);

                const [name] = collaborator.name.split(' ');

                return {
                  start: true,
                  message:
                    `✅ Otimo *${name}*, escolha uma das opções abaixo:\n\n` +
                    '*1.* Indicação de cliente\n' +
                    '*2.* Demais informações\n' +
                    '*3.* Encerrar atendimento',
                };
              }
            }

            await this.conversationsService.execute(this.from, 'open');

            return {
              message:
                '✅ Otimo, escolha uma das opções abaixo:\n\n' +
                '*1.* Sou colaborador (a)\n' +
                '*2.* Demais informações\n' +
                '*3.* Encerrar atendimento',
            };

          case '2':
            conversation.name = nameConversation;
            conversation.status = 'close';
            await this.conversationsService.update(conversation);
            return {
              end: true,
            };
          default:
            return {
              message: [
                '😕 Hum, infelizmente não encontramos a opção informada, ' +
                  'por favor tente novamente',
                'Escolha uma das opções abaixo:\n\n' +
                  '*1.* Sim\n' +
                  '*2.* Não',
              ],
            };
        }

      default:
        return {
          message:
            '😷 Estamos passando por dificuldades técnicas, ' +
            'peço que retorne o contato mais tarde',
          end: true,
        };
    }
  }
}

export default ConversationManager;
