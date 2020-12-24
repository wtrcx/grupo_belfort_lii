import ViaCepCache from '@cache/viaCepCache';
import ViaCepService from '@services/viaCepService';
import { ReturnScript } from '../../interfaces';

const address = async (message: string): Promise<ReturnScript> => {
  const regex = new RegExp('^[0-9]{8}$');

  if (regex.test(message)) {
    const viaCepService = new ViaCepService(message);
    const addressByCep = await viaCepService.consulta();

    if (addressByCep.status === 200) {
      ViaCepCache.set(message, addressByCep);
      return {
        status: true,
        message:
          'Este foi o endereço encontrado:\n\n' +
          `*Logradouro:* ${addressByCep.logradouro}\n` +
          `*Bairro:* ${addressByCep.bairro}\n` +
          `*Cidade:* ${addressByCep.localidade}\n` +
          `*UF:* ${addressByCep.uf}\n\n` +
          'O endereço está correto?\n\n' +
          '*1.* Sim\n' +
          '*2.* Não',
      };
    }
    return {
      message: [
        `❌ Infelizmente não encontramos o CEP *${message}*.`,
        `Tente novamente!`,
      ],
    };
  }

  return {
    message: [
      `❌ O CEP *${message}* não atende as regras pré-estabelecidas!`,
      `Tente novamente!`,
    ],
  };
};

export default address;
