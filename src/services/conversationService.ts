import { getCustomRepository } from 'typeorm';

import ConversationsRepository from '@repositories/conversationRepository';
import Conversation from '@models/Conversations';
import Client from '@models/Client';
import ConversationDTO from '@dtos/conversationDTO';
import Historic from '@models/Historic';
import CustomerIndicationDTO from '@dtos/customerIndicationDTO';
import BeWorkerDTO from '@dtos/beWorkerDTO';

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

  public async delete(conversation: Conversation): Promise<void> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );

    conversationsRepository.remove(conversation);
  }

  public async getAllHistoric(): Promise<ConversationDTO[]> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );

    const conversations = await conversationsRepository.getAllHistoric();

    const conversationsDTO: ConversationDTO[] = conversations.map(
      conversation => {
        return {
          id: conversation.id,
          client: conversation.client.script,
          service: conversation.client.service,
          company: conversation.collaborator
            ? conversation.collaborator.company
            : null,
          re: conversation.collaborator ? conversation.collaborator.re : null,
          name: conversation.collaborator
            ? conversation.collaborator.name
            : null,
          email: conversation.collaborator
            ? conversation.collaborator.email
            : null,
          phone: conversation.access,
          script: conversation.name,
          date: conversation.created_at,
          historic: this.toDTO(conversation.name, conversation.historic),
        };
      },
    );

    return conversationsDTO;
  }

  public toDTO(
    name: string,
    historic: Historic[],
  ): CustomerIndicationDTO | BeWorkerDTO | null {
    switch (name) {
      case 'customer_indication':
        const customerIndicationDTO = new Object();

        historic.forEach(x => {
          customerIndicationDTO[x.request] = x.response;
        });

        return customerIndicationDTO as CustomerIndicationDTO;

      case 'be_worker':
        const beWorkerDTO = new Object();

        historic.forEach(x => {
          beWorkerDTO[x.request] = x.response;
        });

        return beWorkerDTO as BeWorkerDTO;

      default:
        return null;
    }
  }
}

export default ConversationsService;
