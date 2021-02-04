import { ReturnScript } from '../../interfaces';

const vacancy = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[a-zA-Z\\d\\-_\\s]+$');

  if (regex.test(message) && message.length > 3) {
    return {
      status: true,
      message:
        '📄 Agora preciso que nós envie o se currículo.\n' +
        'Os seguintes arquivos serão aceitos:\n\n' +
        '*Documento:* pdf, doc, docx e odt\n\n' +
        'Ou se preferir, caso seu curriculo possua apenas uma página,' +
        ' basta nos enviar *uma* foto através da sua câmera.' +
        ' Não se esqueça de enquadrar adequadamente o seu currículo',
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
