import IntentService from '@services/intentService';
import { ReturnScript } from 'src/scripts/interfaces';

const process = async (
  script: string,
  phrase: string,
  attempts: number,
): Promise<ReturnScript> => {
  const processPhrase = await IntentService.process(script, phrase);

  if (processPhrase) {
    return {
      status: true,
      message: [
        processPhrase.answer,
        'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
      ],
    };
  }

  let message: string | string[];

  switch (attempts) {
    case 1:
      message =
        '😕 Não entendi a sua dúvida, poderia ser um pouco mais especifico.';
      break;

    case 2:
      message = '😕 Hum, continuo sem entender. Vamos tentar mais uma vez.';
      break;

    default:
      message = [
        '😢 Sinto muito, infelizmente não consegui te ajudar, mas não desanime, irei transferir o seu' +
          ' atendimento para a nosso SAC.',
      ];
      break;
  }

  return {
    message,
  };
};

export default process;
