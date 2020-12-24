import ViaCepCache from '@cache/viaCepCache';
import ViaCepDTO from '@dtos/viaCepDto';
import ServerError from '@errors/serverError';
import Client from '@models/Client';
import Conversations from '@models/Conversations';
import ConversationsService from '@services/conversationService';
import HistoricService from '@services/historicService';

import { ReturnScript } from '../../interfaces';

// Script: Customer Indication
import name from './01.name';
import email from './02.email';
import phone from './03.phone';
import address from './04.address';
import number from './05.number';
import complement from './06.complement';

class CustomerIndication {
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
    if (this.message.toLowerCase() === 'sair') {
      conversation.name = 'customer_indication_closed';
      await this.conversationsService.update(conversation);
      return {
        message: 'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
        finish: true,
      };
    }
    const history = await this.historicService.sequenceStatus(conversation);

    if (history) {
      switch (history.sequence) {
        case 1:
          const nameScript = await name(this.message);

          if (nameScript.status) {
            history.response = this.message.toUpperCase();
            await this.historicService.update(history);

            await this.historicService.execute(
              conversation,
              2,
              'email',
              'option',
            );

            return { message: nameScript.message };
          }

          return { message: nameScript.message, end: nameScript.end };
        case 2:
          if (history.response === 'option') {
            switch (this.message) {
              case '1':
                history.response = '1';
                await this.historicService.update(history);
                return {
                  message:
                    '➡️ Preciso que nos informe agora o ✉️ *e-mail* do cliente!',
                };
              case '2':
                history.response = '2';
                await this.historicService.update(history);
                return {
                  message:
                    '➡️ Preciso que nos informe agora o ✉️ *e-mail* do cliente!',
                };
              case '3':
                history.response = 'not opting';
                await this.historicService.update(history);
                await this.historicService.execute(
                  conversation,
                  3,
                  'phone',
                  '',
                );
                return {
                  message: [
                    '📞 Vamos cadastrar agora o telefone do cliente',
                    'É necessário que nós informe o *DDD* (Ex: 11) e o telefone ' +
                      'deve ser composto apenas os numeros.\n\n' +
                      'Exemplo: *Celular:* 11988887777 ou *Fixo:* 1188887777',
                    '➡️ Nos informe agora o *telefone do cliente*:',
                  ],
                };
              default:
                return {
                  message: [
                    '😕 Hum, infelizmente não encontramos a opção informada, por favor tente novamente',
                    'Escolha uma das opções abaixo:\n\n*1.* Possuo ✉️ *e-mail* e 📞 *telefone*\n' +
                      '*2.* Possuo apenas o ✉️ *e-mail*\n*2.* Possuo apenas o 📞 *telefone* ',
                  ],
                };
            }
          }

          const emailScript = await email(this.message);

          if (emailScript.status) {
            emailScript.message = [
              '➡️ Vamos cadastrar o endereço do cliente',
              'Para isso, basta nos informar o *CEP* do local:',
              'Algumas regras:\n\n' +
                '* Informe o *CEP* completo com os 8 digitos\n' +
                '* O *CEP* deve possuir apenas numeros\n',
            ];

            if (history.response === '2') {
              await this.historicService.execute(
                conversation,
                3,
                'phone',
                'not opting',
              );

              await this.historicService.execute(conversation, 4, 'cep', '');
            } else {
              emailScript.message = [
                '📞 Vamos cadastrar agora o telefone do cliente',
                'É necessário que nós informe o *DDD* (Ex: 11) e o telefone ' +
                  'deve ser composto apenas os numeros.\n\n' +
                  'Exemplo: *Celular:* 11988887777 ou *Fixo:* 1188887777',
                '➡️ Nos informe o *telefone do cliente*:',
              ];
              await this.historicService.execute(conversation, 3, 'phone', '');
            }

            history.response = this.message.toLowerCase();
            await this.historicService.update(history);

            return { message: emailScript.message };
          }

          return { message: emailScript.message, end: emailScript.end };
        case 3:
          const phoneScript = await phone(this.message);

          if (phoneScript.status) {
            history.response = this.message;
            await this.historicService.update(history);
            await this.historicService.execute(conversation, 4, 'cep', '');

            return { message: phoneScript.message };
          }

          return { message: phoneScript.message, end: phoneScript.end };
        case 4:
          const [validCEP, cep] = history.response.split('@');

          if (validCEP === 'OK') {
            switch (this.message) {
              case '1':
                const { logradouro, bairro, localidade, uf } = ViaCepCache.get(
                  cep,
                ) as ViaCepDTO;

                if (!logradouro || !bairro || !localidade || !uf) {
                  throw new ServerError('Internal server error');
                }

                history.response = cep;
                await this.historicService.update(history);

                await this.historicService.execute(
                  conversation,
                  4,
                  'logradouro',
                  logradouro,
                );
                await this.historicService.execute(
                  conversation,
                  4,
                  'bairro',
                  bairro,
                );

                await this.historicService.execute(
                  conversation,
                  4,
                  'localidade',
                  localidade,
                );

                await this.historicService.execute(conversation, 4, 'uf', uf);

                await this.historicService.execute(
                  conversation,
                  5,
                  'numero',
                  '',
                );

                return {
                  message: [
                    '➡️ Agora preciso do *numero* do local.',
                    '* Informe apenas *numeros*, *letras* \n' +
                      'e *espaços* com até 10 caracteres',
                  ],
                };
              case '2':
                history.response = '';
                await this.historicService.update(history);

                return {
                  message: '➡️ Digite novamente o *CEP* do cliente.',
                };
              default:
                return {
                  message:
                    '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
                  end: true,
                };
            }
          }

          const addressScript = await address(this.message);

          if (addressScript.status) {
            history.response = `OK@${this.message}`;
            await this.historicService.update(history);
          }
          return { message: addressScript.message };

        case 5:
          const numberScript = await number(this.message);

          if (numberScript.status) {
            history.response = this.message;
            await this.historicService.update(history);

            await this.historicService.execute(
              conversation,
              6,
              'complemento',
              '',
            );

            return { message: numberScript.message };
          }

          return { message: numberScript.message };

        case 6:
          const complementScript = await complement(this.message);

          if (complementScript.status) {
            history.response =
              this.message === '1' ? 'not opting' : complementScript.data;
            await this.historicService.update(history);

            return {
              message: complementScript.message,
              finish: complementScript.finish,
            };
          }

          return { message: complementScript.message };

        default:
          return {
            message:
              '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
            end: true,
          };
      }
    }
    return {
      message:
        '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
      end: true,
    };
  }
}

export default CustomerIndication;
