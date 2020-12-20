import { create, Whatsapp } from 'venom-bot';

import fs from 'fs';
import path from 'path';
import BadRequest from '@errors/badRequest';
import ClientRepository from '@repositories/clientRepository';
import { getCustomRepository } from 'typeorm';
import ServerError from '@errors/serverError';
import UserRepository from '@repositories/userRepository';

interface WAClient {
  id: string;
  script: string;
  qrcode: string;
}

class WhatsappService {
  public async create(
    script: string,
    host: string | undefined,
    userId: string,
  ): Promise<WAClient> {
    const clientRepository: ClientRepository = getCustomRepository(
      ClientRepository,
    );

    const userRepository: UserRepository = getCustomRepository(UserRepository);

    if (!script) {
      throw new BadRequest('The following data is mandatory: script');
    }

    if (!host) {
      throw new ServerError('Internal server error');
    }
    if (!userId) {
      throw new ServerError('Internal server error');
    }

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new ServerError('Internal server error');
    }

    const client = clientRepository.create({ service: 'whatsapp', script });

    client.user = user;

    await clientRepository.save(client);

    return {
      id: client.id,
      script,
      qrcode: `http://${host}/whatsapp/qr/${client.id}.png`,
    };
  }

  public async client(clientId: string): Promise<void> {
    const imageDirection = path.resolve(__dirname, '..', 'tmp', 'whatsapp');

    const clientRepository: ClientRepository = getCustomRepository(
      ClientRepository,
    );

    const whatsappClient = await clientRepository.findOne({
      where: { id: clientId },
    });

    if (!whatsappClient) {
      throw new ServerError('Internal server error');
    }

    const whatsapp = await create(
      clientId,
      base64Qr => {
        const matches = base64Qr.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error('Venom API: Invalid input string');
        }

        const type = matches[1];
        const data = Buffer.from(matches[2], 'base64');

        const imageBuffer = { type, data };

        fs.writeFile(
          `${imageDirection}/${clientId}.png`,
          imageBuffer.data,
          'binary',
          err => {
            if (err != null) {
              throw new Error(`Venom API: ${err.message}`);
            }
          },
        );
      },
      undefined,
      {
        logQR: false,
      },
    );

    try {
      const token = await whatsapp.getSessionTokenBrowser();
      whatsappClient.access = token.WABrowserId;
      await clientRepository.save(whatsappClient);
      this.chat(whatsapp);
      await fs.promises.unlink(`${imageDirection}/${clientId}.png`);
    } catch (error) {
      throw new ServerError(`Venom API: ${error}`);
    }
  }

  public async chat(client: Whatsapp): Promise<void> {
    client.onMessage(async message => {
      if (!message.isGroupMsg) {
        const clientRepository: ClientRepository = getCustomRepository(
          ClientRepository,
        );

        const token = await client.getSessionTokenBrowser();

        const whatsapp = await clientRepository.findOne({
          where: { access: token.WABrowserId },
        });

        if (!whatsapp) {
          throw new ServerError('Internal server error');
        }

        switch (whatsapp.script) {
          case 'grupo_belfort_geral':
            client.sendText(
              message.from,
              'Você está conversando com o GRUPO BELFORT',
            );
            break;

          case 'grupo_mag_geral':
            client.sendText(message.from, 'Você está conversando com o MAG');
            break;

          default:
            break;
        }
      }
    });
  }
}

export default WhatsappService;
