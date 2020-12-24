import Conversation from '@models/Conversations';
import CompanyCache from '@cache/companyCache';
import CompanyDTO from '@dtos/companyDTO';
import { ReturnScript } from '../../interfaces';

const company = async (
  conversation: Conversation,
  message: string,
): Promise<ReturnScript> => {
  const companySequence = parseInt(message, 10);

  if (typeof companySequence !== 'number') {
    return {
      message: '❌ A opção informada está incorreta! Tente novamente.',
    };
  }

  const companyCache = CompanyCache.get(conversation.id) as CompanyDTO[];

  const companyIndex = companyCache.findIndex(
    companyDTO => companyDTO.sequence === companySequence,
  );

  if (companyIndex < 0) {
    return {
      message: '❌ A opção informada está incorreta! Tente novamente.',
    };
  }

  return {
    status: true,
    message: '➡️ Agora nos informe seu *RE*.',
    data: companyCache[companyIndex].id,
  };
};

export default company;
