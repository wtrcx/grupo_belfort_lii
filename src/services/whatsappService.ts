import { create, Whatsapp } from 'venom-bot';
import { getCustomRepository } from 'typeorm';

import fs from 'fs';
import path from 'path';

import ClientRepository from '@repositories/clientRepository';
import UserRepository from '@repositories/userRepository';

import BadRequest from '@errors/badRequest';
import ServerError from '@errors/serverError';

import ScriptManager from '../scripts';

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
    const imageDirection = path.resolve(
      __dirname,
      '..',
      'tmp',
      'whatsapp',
      `${clientId}.png`,
    );

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
          throw new ServerError('Venom API: Invalid input string');
        }

        const type = matches[1];
        const data = Buffer.from(matches[2], 'base64');

        const imageBuffer = { type, data };

        fs.writeFile(imageDirection, imageBuffer.data, 'binary', err => {
          if (err != null) {
            throw new ServerError(`Venom API: ${err.message}`);
          }
        });
      },
      undefined,
      {
        logQR: false,
        disableWelcome: true,
        updatesLog: false,
        mkdirFolderToken: '/node_modules/venom-bot',
      },
    );

    try {
      const token = await whatsapp.getSessionTokenBrowser();
      whatsappClient.access = token.WABrowserId;
      await clientRepository.save(whatsappClient);
      this.chat(whatsapp);
    } catch (error) {
      throw new ServerError(`Venom API: ${error}`);
    }
  }

  public async chat(client: Whatsapp): Promise<void> {
    await client.onMessage(async message => {
      if (!message.isGroupMsg) {
        const clientRepository: ClientRepository = getCustomRepository(
          ClientRepository,
        );

        const token = await client.getSessionTokenBrowser();

        const whatsapp = await clientRepository.findOne({
          where: { access: token.WABrowserId },
        });

        if (!whatsapp) {
          await client.sendText(
            message.from,
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          );
          return;
        }

        const scriptManager = new ScriptManager(
          whatsapp,
          message.from,
          message.body,
          whatsapp.script,
          whatsapp.service,
        );

        const returnScript = await scriptManager.chat();

        if (Array.isArray(returnScript.message)) {
          returnScript.message.forEach(messages =>
            client.sendText(message.from, messages),
          );
        } else {
          await client.sendText(message.from, returnScript.message);
        }

        if (returnScript.end) {
          await client.clearChat(message.chatId);
        }
      }
    });
  }

  public async restart(): Promise<void> {
    const clientRepository: ClientRepository = getCustomRepository(
      ClientRepository,
    );

    const clients = await clientRepository.find({
      where: { service: 'whatsapp', is_enable: true },
    });

    clients.forEach(client => this.client(client.id));
  }
}

export default WhatsappService;
