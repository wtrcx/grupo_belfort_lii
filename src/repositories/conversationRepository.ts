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
}

export default ConversationsRepository;
