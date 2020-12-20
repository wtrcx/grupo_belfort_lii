import BelfortService from '../../services/BelfortService';
import { ReturnScript } from '../interfaces/index';

const company = async (message: string): Promise<ReturnScript> => {
  const belfortService = new BelfortService();

  const companySequence = parseInt(message, 10);

  if (typeof companySequence !== 'number') {
    return {
      message: '❌ A opção informada está incorreta! Tente novamente.',
    };
  }
  const companyExist = await belfortService.findCompanySequence(
    companySequence,
  );

  if (!companyExist) {
    return {
      message: '❌ A opção informada está incorreta! Tente novamente.',
    };
  }

  return {
    status: true,
    message: '➡️ Agora nos informe seu *RE*.',
    data: companyExist.id,
  };
};

export default company;
