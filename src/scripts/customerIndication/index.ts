import Conversations from '../../models/Conversations';
import ConversationsService from '../../services/ConversationService';
import HistoricService from '../../services/HistoricService';
import { ReturnScript } from '../interfaces';

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

  private readonly from: string;

  private readonly message: string;

  private readonly source: string;

  constructor(from: string, message: string, source: string) {
    this.from = from;
    this.message = message;
    this.source = source;
  }

  public async chat(conversation: Conversations): Promise<ReturnScript> {
    const history = await this.historicService.sequenceStatus(conversation.id);

    if (history) {
      switch (history.sequence) {
        case 1:
          const nameScript = await name(this.message);

          if (nameScript.status) {
            history.response = this.message.toUpperCase();
            await this.historicService.update(history);

            await this.historicService.execute(
              conversation.id,
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
                  conversation.id,
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
                    '➡️ Nos informe o *telefone do cliente*:',
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
                conversation.id,
                3,
                'phone',
                'not opting',
              );

              await this.historicService.execute(conversation.id, 4, 'cep', '');
            } else {
              emailScript.message = [
                '📞 Vamos cadastrar agora o telefone do cliente',
                'É necessário que nós informe o *DDD* (Ex: 11) e o telefone ' +
                  'deve ser composto apenas os numeros.\n\n' +
                  'Exemplo: *Celular:* 11988887777 ou *Fixo:* 1188887777',
                '➡️ Nos informe o *telefone do cliente*:',
              ];
              await this.historicService.execute(
                conversation.id,
                3,
                'phone',
                '',
              );
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
            await this.historicService.execute(conversation.id, 4, 'cep', '');

            return { message: phoneScript.message };
          }

          return { message: phoneScript.message, end: phoneScript.end };
        case 4:
          const [validCEP, ...addressValid] = history.response.split('@');

          if (validCEP === 'OK') {
            switch (this.message) {
              case '1':
                [history.response] = addressValid;
                await this.historicService.update(history);

                await this.historicService.execute(
                  conversation.id,
                  4,
                  'logradouro',
                  addressValid[1],
                );
                await this.historicService.execute(
                  conversation.id,
                  4,
                  'bairro',
                  addressValid[2],
                );

                await this.historicService.execute(
                  conversation.id,
                  4,
                  'localidade',
                  addressValid[3],
                );

                await this.historicService.execute(
                  conversation.id,
                  4,
                  'uf',
                  addressValid[4],
                );

                await this.historicService.execute(
                  conversation.id,
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
                    '😷 Estamos passando por dificuldades técnicas, ' +
                    'peço que retorne o contato mais tarde',
                  end: true,
                };
            }
          }

          const addressScript = await address(this.message);

          if (addressScript.status) {
            const {
              cep,
              logradouro,
              bairro,
              localidade,
              uf,
            } = addressScript.data;

            history.response = `OK@${cep}@${logradouro}@${bairro}@${localidade}@${uf}`;
            await this.historicService.update(history);
          }
          return { message: addressScript.message };

        case 5:
          const numberScript = await number(this.message);

          if (numberScript.status) {
            history.response = this.message;
            await this.historicService.update(history);

            await this.historicService.execute(
              conversation.id,
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
              '😷 Estamos passando por dificuldades técnicas, ' +
              'peço que retorne o contato mais tarde',
            end: true,
          };
      }
    }
    return {
      message:
        '😷 Estamos passando por dificuldades técnicas, ' +
        'peço que retorne o contato mais tarde',
      end: true,
    };
  }
}

export default CustomerIndication;
