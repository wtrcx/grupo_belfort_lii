import Client from '@models/Client';
import Conversation from '@models/Conversations';
import { EntityRepository, Repository, Between } from 'typeorm';

@EntityRepository(Conversation)
class ConversationsRepository extends Repository<Conversation> {
  public async findConversationOnTime(
    client: Client,
    access: string,
  ): Promise<Conversation | null> {
    const startDate = new Date(new Date().getTime() - 1800000);
    const endDate = new Date(new Date().getTime());

    const conversation = await this.findOne({
      relations: ['client', 'collaborator'],
      where: {
        client,
        access,
        created_at: Between(startDate, endDate),
        close: false,
      },
    });

    if (!conversation) {
      return null;
    }

    return conversation;
  }

  public async getAllHistoricClose(
    conversation?: Conversation,
  ): Promise<Conversation[] | Conversation | null> {
    const conversations = conversation
      ? await this.findOne({
          relations: ['client', 'collaborator', 'historic'],
          where: { id: conversation.id, close: true },
        })
      : await this.find({
          relations: ['client', 'collaborator', 'historic'],
          where: { close: true },
        });

    if (!conversations) {
      return null;
    }
    return conversations;
  }

  public async getAllHistoricOpen(
    conversation?: Conversation,
  ): Promise<Conversation[] | Conversation | null> {
    const conversations = conversation
      ? await this.findOne({
          relations: ['client', 'collaborator', 'historic'],
          where: { id: conversation.id, close: false },
        })
      : await this.find({
          relations: ['client', 'collaborator', 'historic'],
          where: { close: false },
        });

    if (!conversations) {
      return null;
    }

    return conversations;
  }
}

export default ConversationsRepository;
