import Conversation from '@models/Conversations';
import Historic from '@models/Historic';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Historic)
class HistoticRepository extends Repository<Historic> {
  public async searchStatus(
    conversation: Conversation,
  ): Promise<Historic | null> {
    const historic = await this.findOne({
      where: { conversation },
      order: { sequence: 'DESC' },
    });

    if (!historic) {
      return null;
    }

    return historic;
  }

  public async searchSequence(
    conversation: Conversation,
    sequence: number,
  ): Promise<Historic | null> {
    const historic = await this.findOne({
      where: { conversation, sequence },
    });

    if (!historic) {
      return null;
    }

    return historic;
  }
}

export default HistoticRepository;
