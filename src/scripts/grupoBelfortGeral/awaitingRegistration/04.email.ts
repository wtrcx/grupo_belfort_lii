import { ReturnScript } from '../../interfaces';

const email = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp(
    '^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\\.[a-zA-Z]+\\.?([a-zA-Z]+)?$',
  );

  if (regex.test(message)) {
    return {
      status: true,
      message: [
        '✅ Seu cadastro foi realizado!',
        'Este é o menu exclusivo para os colaboradores do *GRUPO BELFORT*!',
        'Escolha uma das opções abaixo:\n\n' +
          '*1.* Indicação de cliente\n' +
          '*2.* Demais informações\n' +
          '*3.* Encerrar atendimento',
      ],
    };
  }
  return { message: `❌ O email *${message}* não é valido! Tente novamente!` };
};

export default email;
