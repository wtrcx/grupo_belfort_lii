import { ReturnScript } from '../interfaces';

const email = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp(
    '^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\\.[a-zA-Z]+\\.?([a-zA-Z]+)?$',
  );

  if (regex.test(message)) {
    return {
      status: true,
      message: [
        `🔒 Agora vamos cadastrar o seu codigo de segurança\n` +
          `para futuros atendimentos.`,
        'Algumas regras:\n\n' +
          '- O codigo deve possuir apenas 4 caracteres\n' +
          '- O codigo deve ser formado apenas por numeros',
        '➡️ Digite o seu codigo de segurança:',
      ],
    };
  }
  return { message: `❌ O email *${message}* não é valido! Tente novamente!` };
};

export default email;
