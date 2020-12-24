import { ReturnScript } from '../../interfaces';

const documentConfirmation = async (
  docConfirmation: string,
  message: string,
): Promise<ReturnScript> => {
  const [type, doc, chances] = docConfirmation.split(':');

  if (doc !== message) {
    switch (chances) {
      case '0':
        return {
          message:
            `❌ O *${type}* informado está incorreto, você tem somente mais ` +
            `*02* tentativas antes de encerrarmos o atendimento!`,
          data: 1,
        };
      case '1':
        return {
          message:
            `❌ O *${type}* informado está incorreto, você tem somente mais ` +
            `*01* tentativa antes de encerrarmos o atendimento!`,
          data: 2,
        };
      default:
        return {
          message:
            `❌ Infelizmente não conseguimos validar o seu *${type}*.\n\n` +
            `Entre em contato com a nossa central de atendimento e atualize o seu cadastro.`,
          end: true,
        };
    }
  }

  return {
    status: true,
    message: [
      `✅ O seu *${type}* foi confirmado.`,
      '➡️ Deseja cadastrar seu e-mail?\n\n*1.* Sim\n*2.* Não\n\n' +
        '📣 *Importante:* Através do e-mail, você fica por dentro das ultimas novidades' +
        ' do *GRUPO BELFORT*.',
    ],
  };
};

export default documentConfirmation;
