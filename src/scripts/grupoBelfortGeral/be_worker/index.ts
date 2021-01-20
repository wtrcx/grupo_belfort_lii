import Conversations from '@models/Conversations';
import ConversationsService from '@services/conversationService';
import HistoricService from '@services/historicService';
import { ReturnScript } from 'src/scripts/interfaces';

import fs from 'fs';

import ViaCepCache from '@cache/viaCepCache';

// Script: Authentication Collaborators
import Client from '@models/Client';
import ViaCepDTO from '@dtos/viaCepDTO';
import ServerError from '@errors/serverError';
import FileDTO from '@dtos/fileDTO';
import EmailService from '@services/emailService';
import name from './01.name';
import email from './02.email';
import address from './03.address';
import vacancy from './04.vacancy';
import file from './05.file';

class BeWorker {
  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly historicService: HistoricService = new HistoricService();

  private readonly client: Client;

  private readonly from: string;

  private readonly message: string;

  private readonly service: string;

  private readonly file: FileDTO | undefined;

  constructor(
    client: Client,
    from: string,
    message: string,
    service: string,
    filePath?: FileDTO,
  ) {
    this.client = client;
    this.from = from;
    this.message = message;
    this.service = service;
    this.file = filePath;
  }

  public async chat(conversation: Conversations): Promise<ReturnScript> {
    let historic = await this.historicService.sequenceStatus(conversation);

    if (!historic) {
      historic = await this.historicService.execute(
        conversation,
        1,
        'name',
        '',
      );
    }

    switch (historic.sequence) {
      case 1:
        const nameScript = await name(this.message);

        if (nameScript.status) {
          historic.response = this.message.toUpperCase();
          await this.historicService.update(historic);

          await this.historicService.execute(conversation, 2, 'email', '');

          return { message: nameScript.message };
        }

        return { message: nameScript.message, end: nameScript.end };

      case 2:
        const emailScript = await email(this.message);

        if (emailScript.status) {
          historic.response = this.message.toLowerCase();
          await this.historicService.update(historic);

          await this.historicService.execute(conversation, 3, 'zip_code', '');

          return { message: emailScript.message };
        }

        return {
          message: emailScript.message,
          end: emailScript.end,
        };

      case 3:
        const [validCEP, cep] = historic.response.split('@');

        if (validCEP === 'OK') {
          switch (this.message) {
            case '1':
              const { logradouro, bairro, localidade, uf } = ViaCepCache.get(
                cep,
              ) as ViaCepDTO;

              if (!logradouro || !bairro || !localidade || !uf) {
                throw new ServerError('Internal server error');
              }

              historic.response = cep;
              await this.historicService.update(historic);

              await this.historicService.execute(
                conversation,
                3,
                'public_place',
                logradouro,
              );
              await this.historicService.execute(
                conversation,
                3,
                'neighborhood',
                bairro,
              );

              await this.historicService.execute(
                conversation,
                3,
                'locality',
                localidade,
              );

              await this.historicService.execute(conversation, 3, 'state', uf);

              await this.historicService.execute(
                conversation,
                4,
                'vacancy',
                '',
              );

              return {
                message: [
                  '➡️ Agora preciso que nos informe a vaga desejada.',
                  '*Exemplos*: Vigilante, Porteiro, Recepcionista, etc...',
                ],
              };
            case '2':
              historic.response = '';
              await this.historicService.update(historic);

              return {
                message: '➡️ Digite seu *CEP* novamente.',
              };
            default:
              return {
                message:
                  '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
                end: true,
              };
          }
        }

        const addressScript = await address(this.message);

        if (addressScript.status) {
          historic.response = `OK@${this.message}`;
          await this.historicService.update(historic);
        }
        return { message: addressScript.message };

      case 4:
        const vacancyScript = await vacancy(this.message);

        if (vacancyScript.status) {
          historic.response = this.message.toUpperCase();
          await this.historicService.update(historic);

          await this.historicService.execute(
            conversation,
            5,
            'file',
            'not_opting',
          );

          return {
            message: vacancyScript.message,
          };
        }

        return { message: vacancyScript.message, end: vacancyScript.end };

      case 5:
        if (historic.response === 'not_opting') {
          switch (this.message) {
            case '1':
              historic.response = 'optant';
              await this.historicService.update(historic);
              return {
                message: [
                  'OK, os seguintes arquivos serão aceitos:\n\n' +
                    '*Documento:* pdf, doc, docx e odt\n\n' +
                    'Ou se preferir, basta nos enviar uma foto através da sua câmera.' +
                    ' Não se esqueça de enquadrar adequadamente o seu currículo',
                ],
              };
            case '2':
              await this.sendEmail(conversation);

              return {
                message: [
                  '🤝 Ótimo, temos todas as informações necessárias para o seu cadastro.',
                  'Posso lhe ajudar com algo mais?\n\n*1.* Sim\n*2.* Não',
                ],
                finish: true,
              };
            default:
              if (this.file) {
                await fs.promises.unlink(this.file.filePath);
              }

              return {
                message: [
                  '😕 Hum, infelizmente não encontramos a opção informada, por favor tente novamente',
                  'Escolha uma das opções abaixo:\n\n*1.* Sim, desejo enviar o meu *currículo*.\n' +
                    '*2.* Não, seguirei sem enviar o meu *currículo*.',
                ],
              };
          }
        }

        if (this.file) {
          const fileScript = await file(this.file);

          if (fileScript.status) {
            historic.response = 'confirmed';
            await this.historicService.update(historic);

            await this.sendEmail(conversation, this.file);

            return fileScript;
          }
        }

        return {
          message:
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          end: true,
        };
      default:
        return {
          message:
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          end: true,
        };
    }
  }

  public async sendEmail(
    conversation: Conversations,
    filePath?: FileDTO,
  ): Promise<boolean> {
    const beWorkerDTO = await this.historicService.getHistoryByConversation(
      conversation,
    );

    if (beWorkerDTO) {
      beWorkerDTO.file = filePath;

      const emailService = new EmailService(
        'wxavier@belfort.com.br',
        'grupobelfort551137232021@gmail.com',
      );

      await emailService.send(
        beWorkerDTO.email,
        '[LILI] - Trabalhe Conosco',
        'teste',
        filePath,
      );
      return true;
    }

    return false;
  }
}

export default BeWorker;
