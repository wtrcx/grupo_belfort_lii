import { getCustomRepository } from 'typeorm';

import HistoricRepository from '@repositories/historicRepository';
import Historic from '@models/Historic';
import Conversation from '@models/Conversations';
import BeWorkerDTO from '@dtos/beWorkerDTO';
import CustomerIndicationDTO from '@dtos/customerIndicationDTO';

class HistoricService {
  private readonly historicRepository: HistoricRepository = getCustomRepository(
    HistoricRepository,
  );

  public async sequenceStatus(
    conversation: Conversation,
  ): Promise<Historic | null> {
    const historic = await this.historicRepository.searchStatus(conversation);

    if (!historic) {
      return null;
    }

    return historic;
  }

  public async findSequence(
    conversation: Conversation,
    sequence: number,
  ): Promise<Historic | null> {
    const historic = await this.historicRepository.searchSequence(
      conversation,
      sequence,
    );

    return historic;
  }

  public async execute(
    conversation: Conversation,
    sequence: number,
    request: string,
    response: string,
  ): Promise<Historic> {
    const historic = this.historicRepository.create({
      sequence,
      request,
      response,
    });

    historic.conversation = conversation;

    await this.historicRepository.save(historic);

    return historic;
  }

  public async update(historic: Historic): Promise<Historic> {
    await this.historicRepository.save(historic);

    return historic;
  }

  public async delete(historic: Historic): Promise<void> {
    await this.historicRepository.remove(historic);
  }

  public toDTO(
    conversation: Conversation,
  ): CustomerIndicationDTO | BeWorkerDTO | null {
    switch (conversation.name) {
      case 'customer_indication':
        const customerIndicationDTO = new Object() as CustomerIndicationDTO;

        conversation.historic.forEach(x => {
          customerIndicationDTO[x.request] = x.response;
        });

        return customerIndicationDTO;

      case 'be_worker':
        const beWorkerDTO = new Object() as BeWorkerDTO;

        conversation.historic.forEach(x => {
          beWorkerDTO[x.request] = x.response;
        });

        beWorkerDTO.phone = conversation.access;

        return beWorkerDTO;

      default:
        return null;
    }
  }
}

export default HistoricService;
