import { ReturnScript } from '../../interfaces';

const name = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[a-zA-Z\\d\\-_\\s]+$');

  if (regex.test(message) && message.length > 4) {
    return {
      status: true,
      message: '➡️ Agora nos informe o seu e-mail!.',
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
