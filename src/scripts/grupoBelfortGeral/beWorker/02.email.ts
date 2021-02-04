import { ReturnScript } from '../../interfaces';

const email = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp(
    '^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\\.[a-zA-Z]+\\.?([a-zA-Z]+)?$',
  );
  if (regex.test(message)) {
    return {
      status: true,
      message: [
        '➡️ Vamos cadastrar agora o seu endereço, assim poderemos lhe oferecer as vagas de acordo com a sua localidade',
        'Para isso, basta nos informar o *CEP* do seu endereço:',
        'Algumas regras:\n\n' +
          '* Informe o *CEP* completo com os 8 digitos\n' +
          '* O *CEP* deve possuir apenas numeros\n',
      ],
    };
  }

  return {
    message: [`❌ O email *${message}* não é valido!`, `Tente novamente!`],
  };
};

export default email;
