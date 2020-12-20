import Conversations from '../../models/Conversations';
import AuthenticationService from '../../services/AuthenticationService';
import ConversationsService from '../../services/ConversationService';
import HistoricService from '../../services/HistoricService';
import CollaboratorService from '../../services/CollaboratorService';
import BelfortService from '../../services/BelfortService';
import { ReturnScript } from '../interfaces/index';

// Script: Authentication Collaborators
import company from './01.company';
import re from './02.re';
import documentConfirmation from './03.documentConfirmation';
import email from './04.email';
import securityCode from './05.securityCode';

class AuthenticationCollaborators {
  private readonly authenticationService: AuthenticationService = new AuthenticationService();

  private readonly belfortService: BelfortService = new BelfortService();

  private readonly collaboratorService: CollaboratorService = new CollaboratorService();

  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly historicService: HistoricService = new HistoricService();

  private readonly from: string;

  private readonly message: string;

  private readonly source: string;

  constructor(from: string, message: string, source: string) {
    this.from = from;
    this.message = message;
    this.source = source;
  }

  public async chat(conversation: Conversations): Promise<ReturnScript> {
    let cell_phone;
    let collaborator;

    switch (this.source) {
      case 'whatsapp':
        [cell_phone] = this.from.split('@');

        const collaboratorBlocked = await this.collaboratorService.findCollaboratorByCellPhoneBlocked(
          cell_phone,
        );

        if (collaboratorBlocked) {
          return {
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

          if (!collaboratorOff) {
            collaborator.is_enable = 'blocked';

            this.collaboratorService.update(collaborator);

            return {
              message:
                `🚫 O seu cadastro encontra-se bloqueado em nossa plataforma!\n\n` +
                `Entre em contato com a nossa central de atendimento.`,
              end: true,
            };
          }
        }

        break;

      default:
        break;
    }

    let authentication = await this.authenticationService.isAuthenticated(
      conversation,
    );

    if (!authentication) {
      authentication = await this.authenticationService.generateAuthentication(
        conversation,
      );
    }

    let historic = await this.historicService.sequenceStatus(authentication.id);

    if (!historic) {
      conversation.name = 'awaiting authentication';
      this.conversationsService.update(conversation);

      if (!collaborator) {
        historic = await this.historicService.execute(
          authentication.id,
          1,
          'company',
          '',
        );

        const companies = await this.belfortService.findAllCompanies();

        if (!companies) {
          return {
            message:
              '😷 Estamos passando por dificuldades técnicas, ' +
              'peço que retorne o contato mais tarde',
            end: true,
          };
        }

        return {
          message: [
            '🕵️‍♀️ De acordo com a nossa plataforma, está a primeira vez ' +
              'que conversamos e por motivos de segurança, precisamos' +
              ' que se identifique.',
            companies.reduce((previous, currentValue) => {
              return previous.concat(
                `\n*${currentValue.sequence}* - ${currentValue.name}`,
              );
            }, '➡️ Selecione a sua *EMPRESA*:\n'),
          ],
        };
      }

      historic = await this.historicService.execute(
        authentication.id,
        5,
        'security code',
        '0',
      );

      const [name] = collaborator.name.split(' ');

      return {
        message:
          `✌ Olá *${name}*, para continuar o seu atendimento, ` +
          `preciso que nós informe o seu *codígo de segurança*:`,
      };
    }

    switch (historic.sequence) {
      case 1:
        const companyScript = await company(this.message);
        if (companyScript.status) {
          historic.response = companyScript.data;

          await this.historicService.update(historic);

          historic = await this.historicService.execute(
            authentication.id,
            2,
            're',
            're',
          );
          return {
            message: companyScript.message,
          };
        }

        return { message: companyScript.message };

      case 2:
        if (historic.response === 're') {
          const companyId = await this.historicService.findSequence(
            authentication.id,
            1,
          );

          if (companyId) {
            let reScript;
            if (this.source === 'whatsapp') {
              reScript = await re(
                this.message,
                parseInt(companyId.response, 10),
                cell_phone,
              );
            } else {
              reScript = await re(
                this.message,
                parseInt(companyId.response, 10),
              );
            }

            if (reScript.status) {
              const [reNumber, docConfirmation] = reScript.data.split('|');

              historic.response = reNumber;
              await this.historicService.update(historic);

              await this.historicService.execute(
                authentication.id,
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
              '😷 Estamos passando por dificuldades técnicas, ' +
              'peço que retorne o contato mais tarde',
            end: true,
          };
        }
        switch (this.message) {
          case '1':
            await this.historicService.delete(historic);
            const companies = await this.belfortService.findAllCompanies();

            if (!companies) {
              return {
                message:
                  '😷 Estamos passando por dificuldades técnicas, ' +
                  'peço que retorne o contato mais tarde',
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
              authentication.id,
              1,
            );

            if (companyId) {
              let reScript;
              if (this.source === 'whatsapp') {
                reScript = await re(
                  this.message,
                  parseInt(companyId.response, 10),
                  cell_phone,
                );
              } else {
                reScript = await re(
                  this.message,
                  parseInt(companyId.response, 10),
                );
              }

              if (reScript.status) {
                const [reNumber, docConfirmation] = reScript.data.split('|');

                historic.response = reNumber;
                await this.historicService.update(historic);

                await this.historicService.execute(
                  authentication.id,
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
                '😷 Estamos passando por dificuldades técnicas, ' +
                'peço que retorne o contato mais tarde',
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
            authentication.id,
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
        if (historic.response === 'optant') {
          const emailScript = await email(this.message);

          if (emailScript.status) {
            historic.response = this.message.toLocaleLowerCase();
            await this.historicService.update(historic);

            await this.historicService.execute(
              authentication.id,
              5,
              'security code',
              '0',
            );

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
                '🚨 Fique tranquilo, não praticamos o envio de *SPANS*.',
                '➡️ Agora nos informe o seu e-mail!.',
              ],
            };

          case '2':
            historic.response = 'not opting';
            await this.historicService.update(historic);

            await this.historicService.execute(
              authentication.id,
              5,
              'security code',
              '0',
            );
            return {
              message: [
                `🔒 Agora vamos cadastrar o seu codigo de segurança\n` +
                  `para futuros atendimentos.`,
                'Algumas regras:\n\n' +
                  '- O codigo deve possuir apenas 4 caracteres\n' +
                  '- O codigo deve ser formado apenas por numeros',
              ],
            };

          default:
            return {
              message: '😕 Não encontramos a opção informada! Tente novamente',
            };
        }

      case 5:
        let securityCodeScript;
        if (collaborator) {
          securityCodeScript = await securityCode(
            this.message,
            collaborator.security_code,
            historic.response,
          );
        } else {
          securityCodeScript = await securityCode(this.message);
        }

        if (securityCodeScript.status) {
          historic.response = 'authenticated';
          await this.historicService.update(historic);

          authentication.authenticated = true;
          await this.authenticationService.update(authentication);

          if (!collaborator) {
            const newCompany = await this.historicService.findSequence(
              authentication.id,
              1,
            );

            const newRe = await this.historicService.findSequence(
              authentication.id,
              2,
            );

            const newEmail = await this.historicService.findSequence(
              authentication.id,
              4,
            );

            if (newCompany && newRe && newEmail) {
              const collaboratorData = await this.belfortService.findCollaboratorByReAndCompany(
                parseInt(newRe.response, 10),
                parseInt(newCompany.response, 10),
              );

              if (collaboratorData) {
                collaboratorData.email =
                  newEmail.response !== 'not opting' ? newEmail.response : null;
                collaboratorData.security_code = securityCodeScript.data;

                collaborator = await this.collaboratorService.execute(
                  collaboratorData,
                );
              }
            }
          }

          if (collaborator) {
            conversation.collaborator = collaborator;
            await this.conversationsService.update(conversation);

            const authConversation = await this.conversationsService.findConversationById(
              authentication.id,
            );

            if (authConversation) {
              authConversation.collaborator = collaborator;
              await this.conversationsService.update(authConversation);
            }
          }

          return {
            status: securityCodeScript.status,
            message: securityCodeScript.message,
          };
        }

        historic.response = securityCodeScript.data;
        await this.historicService.update(historic);

        if (securityCodeScript.end) {
          if (collaborator) {
            collaborator.is_enable = 'blocked';
            await this.collaboratorService.update(collaborator);
          }
        }

        return {
          message: securityCodeScript.message,
          end: securityCodeScript.end,
        };
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

export default AuthenticationCollaborators;
