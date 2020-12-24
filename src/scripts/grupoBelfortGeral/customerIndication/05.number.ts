import { ReturnScript } from '../../interfaces';

const address = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[a-zA-Z0-9]{1,10}$');

  if (regex.test(message)) {
    return {
      status: true,
      message:
        '➡️ Agora preciso que acrescente mais detalhes do endereço do cliente, tais como:\n\n' +
        '* *Complemento:* Edifício Mobile 75, 3º Andar\n' +
        '* *Ponto de Referência:* Proximo a Academia Bluefit\n\n' +
        'Caso não veja necessidade de nós fornecer estes dados, basta digitar *1*.',
    };
  }
  return {
    message: [
      `❌ O numero *${message}* não atende as regras pré-estabelecidas!`,
      `Tente novamente!`,
    ],
  };
};

export default address;
