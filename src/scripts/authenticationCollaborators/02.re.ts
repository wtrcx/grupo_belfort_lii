import BelfortService from '../../services/BelfortService';
import { ReturnScript } from '../interfaces/index';

const re = async (
  message: string,
  companyId: number,
  cell_phone?: string,
): Promise<ReturnScript> => {
  const belfortService = new BelfortService();
  const regex = new RegExp('^[0-9]{3,5}$');

  if (!regex.test(message)) {
    return {
      message: [
        '❌ Os dados informados estão incorretos!',
        'A empresa selecionada está correta?\n\n' +
          'Digite *1* para *Não* ou informe novamente o seu *RE*!',
      ],
    };
  }

  const reNumber = parseInt(message, 10);

  if (typeof companyId !== 'number' || typeof reNumber !== 'number') {
    return {
      message: [
        '❌ Os dados informados estão incorretos!',
        'A empresa selecionada está correta?\n\n' +
          'Digite *1* para *Não* ou informe novamente o seu *RE*!',
      ],
    };
  }

  const collaborator = await belfortService.findCollaboratorByReAndCompany(
    reNumber,
    companyId,
  );

  if (collaborator) {
    if (cell_phone && collaborator.phone !== cell_phone) {
      const [name] = collaborator.name.split(' ');

      return {
        message:
          `⚠️ *${name}*, este telefone não foi adicionado em sua ficha cadastral!\n\n` +
          `Entre em contato com o *GRUPO BELFORT* e atualize o seu cadastro.`,
        end: true,
      };
    }

    const doc: string[] = ['CPF', 'RG'];

    const docConfirmation = doc[Math.floor(Math.random() * 2)];

    let document;

    if (docConfirmation === 'CPF') {
      document = [collaborator.cpf, 'Informe apenas os *numeros*!'];
    } else {
      document = [collaborator.rg, 'Informe apenas os *numeros* e *letras*!'];
    }
    const [name] = collaborator.name.split(' ');
    return {
      status: true,
      message: [
        `➡️ Legal *${name}*, agora preciso que nos informe o seu *${docConfirmation}* para\n` +
          `confirmarmos o seu cadastro.`,
        document[1],
      ],
      data: `${reNumber}|${docConfirmation}:${document[0]}:0`,
    };
  }
  return {
    message: [
      '❌ Os dados informados estão incorretos!',
      'A empresa selecionada está correta?\n\n' +
        'Digite *1* para *Não* ou informe novamente o seu *RE*!',
    ],
  };
};

export default re;
