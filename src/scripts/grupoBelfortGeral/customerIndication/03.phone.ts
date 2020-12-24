import { ReturnScript } from '../../interfaces';

const phone = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[0-9]{10,11}$');

  if (regex.test(message)) {
    return {
      status: true,
      message: [
        '➡️ Vamos cadastrar o endereço do cliente',
        'Para isso, basta nos informar o *CEP* do local:',
        'Algumas regras:\n\n' +
          '* Informe o *CEP* completo com os 8 digitos\n' +
          '* O *CEP* deve possuir apenas numeros\n',
      ],
    };
  }

  return {
    message: [
      `❌ O telefone *${message}* não atende as regras pré-estabelecidas!`,
      `Tente novamente!`,
    ],
  };
};

export default phone;
