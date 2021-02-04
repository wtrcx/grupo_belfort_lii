import CompanyCache from '@cache/companyCache';
import Client from '@models/Client';
import Conversation from '@models/Conversations';
import CollaboratorsService from '@services/collaboratorService';
import ConversationsService from '@services/conversationService';
import HistoricService from '@services/historicService';
import SarService from '@services/sarService';

import FileDTO from '@dtos/fileDTO';
import { ReturnScript } from '../interfaces';
import AwaitingRegistration from './awaitingRegistration';
import CustomerIndication from './customerIndication';
import BeWorker from './beWorker';
import VirtualAssistant from './virtualAssistant';

class GrupoBelfortGeral {
  private readonly collaboratorService: CollaboratorsService = new CollaboratorsService();

  private readonly sarService: SarService = new SarService();

  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly historicService: HistoricService = new HistoricService();

  private readonly client: Client;

  private readonly from: string;

  private readonly message: string;

  private readonly service: string;

  private readonly file: FileDTO | undefined;

  constructor(
    client: Client,
    from: string,
    message: string,
    service: string,
    file?: FileDTO,
  ) {
    this.client = client;
    this.from = from;
    this.message = message;
    this.service = service;
    this.file = file;
  }

  public async init(): Promise<ReturnScript> {
    switch (this.service) {
      case 'whatsapp':
        const collaborator = await this.collaboratorService.findCollaboratorByCellPhone(
          this.from,
        );

        if (collaborator) {
          if (!collaborator.is_enable) {
            return {
              message:
                `🚫 O seu cadastro encontra-se bloqueado em nossa plataforma!\n\n` +
                `Entre em contato com a nossa central de atendimento.`,
              end: true,
            };
          }

          const collaboratorIsActive = await this.sarService.findCollaboratorByReAndCompany(
            collaborator.re,
            collaborator.company,
          );

          if (!collaboratorIsActive) {
            return {
              message:
                '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
              end: true,
            };
          }

          if (!collaboratorIsActive.status) {
            collaborator.is_enable = false;
            await this.collaboratorService.update(collaborator);
            return {
              status: false,
              message:
                `🚫 O seu cadastro encontra-se bloqueado em nossa plataforma!\n\n` +
                `Entre em contato com a nossa central de atendimento.`,
              end: true,
            };
          }

          const conversation = await this.conversationsService.execute(
            this.client,
            this.from,
            false,
          );

          conversation.collaborator = collaborator;
          await this.conversationsService.update(conversation);

          const [name] = collaborator.name.split(' ');

          return {
            start: true,
            message:
              `🙋🏼‍♀️ Olá *${name}*, seja bem vindo ao atendimento exclusivo para os colaboradores do *GRUPO BELFORT*!\n\n` +
              `Meu nome é *Lili* e darei continuidade ao seu atendimento.\n\n` +
              'Escolha uma das opções abaixo:\n\n' +
              '*1.* Indicação de cliente\n' +
              '*2.* Falar com um atendente\n' +
              '*3.* Demais informações\n' +
              '*4.* Encerrar atendimento',
          };
        }

        await this.conversationsService.execute(this.client, this.from, false);

        return {
          start: true,
          message:
            '🙋🏼‍♀️ Olá, meu nome é *Lili* e faço parte do atendimento virtual do *GRUPO BELFORT*. Seja bem vindo!\n\n' +
            'Este canal é exclusivo para o atendimento dos nossos *colaboradores*.\n\n' +
            'Para começar, escolha uma das opções abaixo:\n\n' +
            '*1.* Sou colaborador (a)\n' +
            '*2.* Trabalhe conosco\n' +
            '*3.* Demais informações\n' +
            '*4.* Encerrar atendimento',
        };

      default:
        return {
          message:
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          end: true,
        };
    }
  }

  public async menu(conversation: Conversation): Promise<ReturnScript> {
    if (conversation.collaborator) {
      switch (this.message.toLowerCase()) {
        case '1':
          conversation.name = 'customer_indication';
          await this.conversationsService.update(conversation);

          await this.historicService.execute(conversation, 1, 'name', '');

          return {
            message: [
              'Você poderá digitar *SAIR* qualquer momento para cancelar está indicação',
              '➡️ Para começar, preciso que nos informe o *nome do cliente*',
              'O *nome do cliente* deverá conter apenas *letras*, *numeros* e *espaço* com no mínimo 5 caracteres.',
            ],
          };
        case '2':
          conversation.name = 'virtual_assistant';
          await this.conversationsService.update(conversation);

          const [name] = conversation.collaborator.name.split(' ');

          return {
            message: [
              `Oi *${name}*, para melhor atende-lo, resuma em apenas uma mensagem a sua dúvida.`,
              'Em que posso ajuda-lo?',
            ],
          };
        case '3':
          conversation.name = 'other_information';
          conversation.close = true;
          await this.conversationsService.update(conversation);

          const newConversation = await this.conversationsService.execute(
            this.client,
            this.from,
            false,
            'complete_conversation',
          );

          newConversation.collaborator = conversation.collaborator;
          await this.conversationsService.update(newConversation);

          return {
            message: [
              'Para demais informações, entre em contato conosco através ' +
                'dos seguintes canais de atendimento:\n\n' +
                '*Para informações comerciais:*\ncomercial@belfort.com.br\n(11) 3723-2029\n\n' +
                '*Central de Atendimento ao Colaborador:*\ncolaborador@belfort.com.br\n(11) 3723-2011\n\n' +
                '*Para informações gerais:*\nrelacionamento@belfort.com.br\n(11) 3723-2020\n\n',
              'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
            ],
            end: true,
          };
        case '4':
          conversation.name = 'unsupported';
          conversation.close = true;
          await this.conversationsService.update(conversation);
          return {
            message: [
              'O *GRUPO BELFORT* agradece o seu contato.',
              'Lembre-se de salvar nosso numero em seus contatos, pois em breve iremos fornecer em nossos status as últimas novidades',
              'Até mais! 👋',
            ],
            end: true,
          };
        default:
          return {
            message:
              '😕 Hum, infelizmente não encontramos a opção informada, ' +
              'por favor tente novamente\n\n' +
              'Escolha uma das opções abaixo:\n\n' +
              '*1.* Indicação de cliente\n' +
              '*2.* Falar com um atendente\n' +
              '*3.* Demais informações\n' +
              '*4.* Encerrar atendimento',
          };
      }
    } else {
      switch (this.message) {
        case '1':
          conversation.name = 'awaiting registration';
          await this.conversationsService.update(conversation);

          await this.historicService.execute(conversation, 1, 'company', '');

          const companies = await this.sarService.findAllCompanies([
            10001,
            10004,
            10007,
            10016,
          ]);

          if (!companies) {
            conversation.name = 'server_error';
            conversation.close = true;
            await this.conversationsService.update(conversation);
            return {
              message:
                '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
              end: true,
            };
          }

          CompanyCache.set(conversation.id, companies);

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
        case '2':
          conversation.name = 'be_worker';
          await this.conversationsService.update(conversation);

          await this.historicService.execute(conversation, 1, 'name', '');

          return {
            message: [
              '➡️ Para começar, preciso que nos informe o seu *nome completo*',
              'Deverá conter apenas *letras* e *espaço* com no mínimo 7 caracteres incluindo o *sobrenome*',
            ],
          };

        case '3':
          conversation.name = 'other_information';
          conversation.close = true;
          await this.conversationsService.update(conversation);

          await this.conversationsService.execute(
            this.client,
            this.from,
            false,
            'complete_conversation',
          );

          return {
            message: [
              'Para demais informações, entre em contato conosco através ' +
                'dos seguintes canais de atendimento:\n\n' +
                '*Para informações comerciais:*\ncomercial@belfort.com.br\n(11) 3723-2029\n\n' +
                '*Central de Atendimento ao Colaborador:*\ncolaborador@belfort.com.br\n(11) 3723-2011\n\n' +
                '*Para informações gerais:*\nrelacionamento@belfort.com.br\n(11) 3723-2020\n\n',
              'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
            ],
            end: true,
          };
        case '4':
          conversation.name = 'unsupported';
          conversation.close = true;
          await this.conversationsService.update(conversation);
          return {
            message: [
              'O *GRUPO BELFORT* agradece o seu contato.',
              'Lembre-se de salvar nosso numero em seus contatos, pois em breve iremos fornecer em nossos status as últimas novidades',
              'Até mais! 👋',
            ],
            end: true,
          };
        default:
          return {
            message:
              '😕 Hum, infelizmente não encontramos a opção informada, ' +
              'por favor tente novamente\n\n' +
              'Escolha uma das opções abaixo:\n\n' +
              '*1.* Sou colaborador (a)\n' +
              '*2.* Trabalhe conosco\n' +
              '*3.* Demais informações\n' +
              '*4.* Encerrar atendimento',
          };
      }
    }
  }

  public async continue(conversation: Conversation): Promise<ReturnScript> {
    const nameScript = conversation.name;

    if (conversation.collaborator) {
      switch (nameScript) {
        case 'customer_indication':
          const customerIndication = new CustomerIndication(
            this.client,
            this.from,
            this.message,
            this.service,
          );

          const customerIndicationReturn = await customerIndication.chat(
            conversation,
          );

          if (customerIndicationReturn.finish) {
            conversation.close = true;
            await this.conversationsService.update(conversation);

            const newConversation = await this.conversationsService.execute(
              this.client,
              this.from,
              false,
              'complete_conversation',
            );

            newConversation.collaborator = conversation.collaborator;
            await this.conversationsService.update(newConversation);
          }

          return customerIndicationReturn;

        case 'complete_conversation':
          await this.conversationsService.delete(conversation);
          switch (this.message) {
            case '1':
              const [name] = conversation.collaborator.name.split(' ');

              const newConversation = await this.conversationsService.execute(
                this.client,
                this.from,
                false,
              );

              newConversation.collaborator = conversation.collaborator;
              await this.conversationsService.update(newConversation);

              return {
                start: true,
                message:
                  `✅ Otimo *${name}*, escolha uma das opções abaixo:\n\n` +
                  '*1.* Indicação de cliente\n' +
                  '*2.* Demais informações\n' +
                  '*3.* Encerrar atendimento\n\n' +
                  'Estou a sua disposição, se preferir, digite *Ei Lili* e eu irei lhe atender.',
              };

            case '2':
              return {
                message: [
                  'O *GRUPO BELFORT* agradece o seu contato.',
                  'Lembre-se de salvar nosso numero em seus contatos, em breve iremos fornecer status',
                  'Até mais! 👋',
                ],
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
        case 'virtual_assistant':
          const virtualAssistant = new VirtualAssistant(
            'grupo_belfort_geral',
            this.client,
            this.from,
            this.message,
            this.service,
          );

          const virtualAssistantReturn = await virtualAssistant.chat(
            conversation,
          );

          return virtualAssistantReturn;

        default:
          conversation.name = 'server_error';
          conversation.close = true;
          await this.conversationsService.update(conversation);
          return {
            message:
              '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
            end: true,
          };
      }
    } else {
      switch (nameScript) {
        case 'awaiting registration':
          const awaitingRegistration = new AwaitingRegistration(
            this.client,
            this.from,
            this.message,
            this.service,
          );

          return awaitingRegistration.chat(conversation);

        case 'be_worker':
          const beWorker = new BeWorker(
            this.client,
            this.from,
            this.message,
            this.service,
            this.file,
          );

          const returnScript = await beWorker.chat(conversation);

          if (returnScript.finish) {
            conversation.close = true;
            await this.conversationsService.update(conversation);

            await this.conversationsService.execute(
              this.client,
              this.from,
              false,
              'complete_conversation',
            );
          }

          return returnScript;

        case 'complete_conversation':
          await this.conversationsService.delete(conversation);

          switch (this.message) {
            case '1':
              await this.conversationsService.execute(
                this.client,
                this.from,
                false,
              );
              return {
                start: true,
                message:
                  `✅ Otimo, escolha uma das opções abaixo:\n\n` +
                  '*1.* Sou colaborador (a)\n' +
                  '*2.* Trabalhe conosco\n' +
                  '*3.* Demais informações\n' +
                  '*4.* Encerrar atendimento',
              };

            case '2':
              return {
                message: [
                  'O *GRUPO BELFORT* agradece o seu contato.',
                  'Lembre-se de salvar nosso numero em seus contatos, pois em breve iremos fornecer em nossos status as últimas novidades',
                  'Até mais! 👋',
                ],
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
          conversation.name = 'server_error';
          conversation.close = true;
          await this.conversationsService.update(conversation);
          return {
            message:
              '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
            end: true,
          };
      }
    }
  }
}

export default GrupoBelfortGeral;
