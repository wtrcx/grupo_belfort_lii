import { ReturnScript } from '../interfaces';

const name = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[a-zA-Z\\d\\-_\\s]+$');

  if (regex.test(message) && message.length > 4) {
    return {
      status: true,
      message: [
        '🗣 Preciso que nós informe ao menos um forma de contato com o cliente.',
        'Escolha uma das opções abaixo:\n\n*1.* Possuo *e-mail* e *telefone*\n' +
          '*2.* Possuo apenas o *e-mail*\n*3.* Possuo apenas o *telefone*',
      ],
    };
  }

  return {
    message: [
      `❌ O nome *${message}* não atende as regras pré-estabelecidas!`,
      'Tente novamente.',
    ],
  };
};

export default name;
