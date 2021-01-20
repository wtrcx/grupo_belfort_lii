import FileDTO from '@dtos/fileDTO';
import fs from 'fs';
import { ReturnScript } from '../../interfaces';

const file = async (fileDTO: FileDTO): Promise<ReturnScript> => {
  const extensions = ['jpeg', 'jpg', 'png', 'bmp', 'pdf', 'doc', 'docx', 'odt'];

  const accept = extensions.some(ext => ext === fileDTO.extenstion);

  if (!accept) {
    await fs.promises.unlink(fileDTO.filePath);
    return {
      message: [
        `❌ Infelizmente o formato ${fileDTO.extenstion} é invalido!`,
        'Tente novamente',
      ],
    };
  }

  return {
    message: [
      '🤝 Ótimo, temos todas as informações necessárias para o seu cadastro.',
      'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
    ],
    finish: true,
    status: true,
  };
};

export default file;
