import { ReturnScript } from '../../interfaces';

const complement = async (message: string): Promise<ReturnScript> => {
  return {
    status: true,
    message: [
      '🤝 Obrigada, você forneceu todas as informações necessárias para está indicação,' +
        ' logo entraremos em contato com você.',
      'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
    ],
    data: message !== '1' ? message : null,
    finish: true,
  };
};

export default complement;
