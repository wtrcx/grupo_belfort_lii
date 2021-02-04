import Client from '@models/Client';
import Conversations from '@models/Conversations';
import ConversationsService from '@services/conversationService';
import HistoricService from '@services/historicService';
import { ReturnScript } from 'src/scripts/interfaces';

import process from './1.process';

class ArtificialIntelligence {
  private readonly conversationsService: ConversationsService = new ConversationsService();

  private readonly historicService: HistoricService = new HistoricService();

  private readonly script: string;

  private readonly client: Client;

  private readonly from: string;

  private readonly message: string;

  private readonly service: string;

  constructor(
    script: string,
    client: Client,
    from: string,
    message: string,
    service: string,
  ) {
    this.client = client;
    this.from = from;
    this.message = message;
    this.service = service;
  }

  public async chat(conversation: Conversations): Promise<ReturnScript> {
    let historic = await this.historicService.sequenceStatus(conversation);

    if (!historic) {
      historic = await this.historicService.execute(
        conversation,
        1,
        this.message,
        '',
      );
    }

    const returnScript = await process(
      this.script,
      this.message,
      historic.sequence,
    );

    if (returnScript.status) {
      if (Array.isArray(returnScript.message)) {
        [historic.response] = returnScript.message;
      }
      await this.historicService.update(historic);

      return returnScript;
    }

    if (historic.sequence === 3) {
      conversation.close = true;
      await this.conversationsService.update(conversation);

      return returnScript;
    }

    await this.historicService.execute(
      conversation,
      historic.sequence + 1,
      '',
      '',
    );

    return returnScript;
  }
}

export default ArtificialIntelligence;
