import { compare } from 'bcryptjs';
import { ReturnScript } from '../interfaces';

const securityCode = async (
  message: string,
  security_code?: string,
  chances?: string,
): Promise<ReturnScript> => {
  const regex = new RegExp('^[0-9]{4}$');

  if (security_code) {
    if (!(await compare(message, security_code))) {
      switch (chances) {
        case '0':
          return {
            message: '❌ O código de segurança informado está incorreto!',
            data: 1,
          };
        case '1':
          return {
            message: '❌ O código de segurança informado está incorreto!',
            data: 2,
          };
        default:
          return {
            message:
              `❌ Por medidas de segurança, o seu cadastro foi bloqueado! Entre em contato com` +
              `a nossa central de atendimento.`,
            data: 'not authenticated',
            end: true,
          };
      }
    }

    return {
      status: true,
      message: [
        '✅ Login efetuado com sucesso!',
        'Este é o menu exclusivo para os colaboradores do *GRUPO BELFORT*!',
        'Escolha uma das opções abaixo:\n\n' +
          '*1.* Indicação de cliente\n' +
          '*2.* Demais informações\n' +
          '*3.* Encerrar atendimento',
      ],
    };
  }

  if (regex.test(message)) {
    return {
      status: true,
      message: [
        '✅ Seu cadastro foi realizado com sucesso!',
        'Este é o menu exclusivo para os colaboradores do *GRUPO BELFORT*!',
        'Escolha uma das opções abaixo:\n\n' +
          '*1.* Indicação de cliente\n' +
          '*2.* Encerrar atendimento',
      ],
      data: message,
    };
  }
  return {
    message: `❌ O código de segurança informado não atende as regras pré-estabelecidas!`,
  };
};

export default securityCode;
