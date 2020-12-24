import Conversation from '@models/Conversations';
import SarService from '@services/sarService';
import CollaboratorCache from '../../../cache/collaboratorCache';
import { ReturnScript } from '../../interfaces';

const re = async (
  conversation: Conversation,
  message: string,
  companyId: number,
  from?: string,
): Promise<ReturnScript> => {
  const sarService = new SarService();
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

  const collaborator = await sarService.findCollaboratorByReAndCompany(
    reNumber,
    companyId,
  );

  if (collaborator) {
    if (!collaborator.status) {
      return {
        status: false,
        message:
          `🚫 O seu cadastro encontra-se bloqueado em nossa plataforma!\n\n` +
          `Entre em contato com a nossa central de atendimento.`,
        end: true,
      };
    }

    if (from && collaborator.phone !== from) {
      const [name] = collaborator.name.split(' ');

      return {
        message:
          `⚠️ *${name}*, este telefone não foi adicionado em sua ficha cadastral!\n\n` +
          `Entre em contato com o *GRUPO BELFORT* e atualize o seu cadastro.`,
        end: true,
      };
    }

    CollaboratorCache.set(conversation.id, collaborator);

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
