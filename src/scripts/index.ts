import Client from '@models/Client';
import ConversationsService from '@services/conversationService';
import GrupoBelfortGeral from './grupoBelfortGeral';
import { ReturnScript } from './interfaces';

class ScriptManager {
  private readonly client: Client;

  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly from: string;

  private readonly message: string;

  private readonly script: string;

  private readonly service: string;

  constructor(
    client: Client,
    from: string,
    message: string,
    script: string,
    service: string,
  ) {
    this.client = client;
    this.from = from;
    this.message = message;
    this.script = script;
    this.service = service;
  }

  public async chat(): Promise<ReturnScript> {
    let access;

    switch (this.service) {
      case 'whatsapp':
        [access] = this.from.split('@');
        break;
      default:
        return {
          message:
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          end: true,
        };
    }

    switch (this.script) {
      case 'grupo_belfort_geral':
        const grupoBelfortGeral = new GrupoBelfortGeral(
          this.client,
          access,
          this.message,
          this.service,
        );

        const conversation = await this.conversationsService.chatOn(
          this.client,
          access,
        );

        let returnScript;

        if (!conversation) {
          returnScript = await grupoBelfortGeral.init();
        } else if (!conversation.name) {
          returnScript = await grupoBelfortGeral.menu(conversation);
        } else {
          returnScript = await grupoBelfortGeral.continue(conversation);
        }

        return returnScript;

      case 'grupo_belfort_financeiro':
        return {
          message:
            '*👨‍🔧 Estamos passando por uma manutenção.* Tente novamente mais tarde!',
          end: true,
        };
      case 'grupo_mag_geral':
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
}

export default ScriptManager;
