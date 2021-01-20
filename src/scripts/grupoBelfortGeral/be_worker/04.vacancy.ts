import { ReturnScript } from '../../interfaces';

const vacancy = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[a-zA-Z\\d\\-_\\s]+$');

  if (regex.test(message) && message.length > 3) {
    return {
      status: true,
      message: 'Deseja anexar o seu currículo?\n\n*1.* Sim\n*2.* Não',
    };
  }

  return {
    message: [
      `❌ A vaga *${message}* não atende as regras pré-estabelecidas!`,
      'Tente novamente.',
    ],
  };
};

export default vacancy;
