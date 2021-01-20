import { getCustomRepository } from 'typeorm';

import ConversationsRepository from '@repositories/conversationRepository';
import Conversation from '@models/Conversations';
import Client from '@models/Client';
import ConversationDTO from '@dtos/conversationDTO';
import NotFound from '@errors/notFound';
import HistoricService from './historicService';

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

  public async getAllHistoricClose(
    conversation?: Conversation,
  ): Promise<ConversationDTO[] | ConversationDTO | null> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );

    const historicService = new HistoricService();

    const conversationList = await conversationsRepository.getAllHistoricClose(
      conversation,
    );

    let conversationsDTO: ConversationDTO[] | ConversationDTO | null;

    if (Array.isArray(conversationList)) {
      conversationsDTO = conversationList.map(conversations => {
        conversations.created_at = new Date(
          conversations.created_at.getTime() - 10800000,
        );
        return {
          id: conversations.id,
          client: conversations.client.script,
          service: conversations.client.service,
          company: conversations.collaborator
            ? conversations.collaborator.company
            : null,
          re: conversations.collaborator ? conversations.collaborator.re : null,
          name: conversations.collaborator
            ? conversations.collaborator.name
            : null,
          email: conversations.collaborator
            ? conversations.collaborator.email
            : null,
          phone: conversations.access,
          script: conversations.name,
          date: conversations.created_at,
          historic: historicService.toDTO(conversations),
        };
      });
    } else if (conversationList) {
      conversationList.created_at = new Date(
        conversationList.created_at.getTime() - 10800000,
      );
      conversationsDTO = {
        id: conversationList.id,
        client: conversationList.client.script,
        service: conversationList.client.service,
        company: conversationList.collaborator
          ? conversationList.collaborator.company
          : null,
        re: conversationList.collaborator
          ? conversationList.collaborator.re
          : null,
        name: conversationList.collaborator
          ? conversationList.collaborator.name
          : null,
        email: conversationList.collaborator
          ? conversationList.collaborator.email
          : null,
        phone: conversationList.access,
        script: conversationList.name,
        date: conversationList.created_at,
        historic: historicService.toDTO(conversationList),
      };
    } else {
      throw new NotFound('Conversation not found');
    }

    return conversationsDTO;
  }

  public async getAllHistoricOpen(
    conversation?: Conversation,
  ): Promise<ConversationDTO[] | ConversationDTO | null> {
    const conversationsRepository = getCustomRepository(
      ConversationsRepository,
    );

    const historicService = new HistoricService();

    const conversationList = await conversationsRepository.getAllHistoricOpen(
      conversation,
    );

    let conversationsDTO: ConversationDTO[] | ConversationDTO | null;

    if (Array.isArray(conversationList)) {
      conversationsDTO = conversationList.map(conversations => {
        conversations.created_at = new Date(
          conversations.created_at.getTime() - 10800000,
        );

        return {
          id: conversations.id,
          client: conversations.client.script,
          service: conversations.client.service,
          company: conversations.collaborator
            ? conversations.collaborator.company
            : null,
          re: conversations.collaborator ? conversations.collaborator.re : null,
          name: conversations.collaborator
            ? conversations.collaborator.name
            : null,
          email: conversations.collaborator
            ? conversations.collaborator.email
            : null,
          phone: conversations.access,
          script: conversations.name,
          date: conversations.created_at,
          historic: historicService.toDTO(conversations),
        };
      });
    } else if (conversationList) {
      conversationList.created_at = new Date(
        conversationList.created_at.getTime() - 10800000,
      );
      conversationsDTO = {
        id: conversationList.id,
        client: conversationList.client.script,
        service: conversationList.client.service,
        company: conversationList.collaborator
          ? conversationList.collaborator.company
          : null,
        re: conversationList.collaborator
          ? conversationList.collaborator.re
          : null,
        name: conversationList.collaborator
          ? conversationList.collaborator.name
          : null,
        email: conversationList.collaborator
          ? conversationList.collaborator.email
          : null,
        phone: conversationList.access,
        script: conversationList.name,
        date: conversationList.created_at,
        historic: historicService.toDTO(conversationList),
      };
    } else {
      throw new NotFound('Conversation not found');
    }

    return conversationsDTO;
  }
}

export default ConversationsService;
