import { getCustomRepository } from 'typeorm';

import ConversationsRepository from '@repositories/conversationRepository';
import Conversation from '@models/Conversations';
import Client from '@models/Client';

class ConversationsService {
  public async chatOn(
    client: Client,
    access: string,
  ): Promise<Conversation | null> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );

    const conversation = await conversationsRepository.findConversationOnTime(
      client,
      access,
    );

    if (!conversation) {
      return null;
    }

    return conversation;
  }

  public async execute(
    client: Client,
    access: string,
    close: boolean,
    name?: string,
  ): Promise<Conversation> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );
    const conversation = conversationsRepository.create({
      client,
      access,
      name,
      close,
    });

    await conversationsRepository.save(conversation);

    return conversation;
  }

  public async update(conversation: Conversation): Promise<void> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );
    await conversationsRepository.save(conversation);
  }
}

export default ConversationsService;
