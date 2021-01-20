import { getCustomRepository } from 'typeorm';
import CollaboratorDTO from '@dtos/collaboratorsDTO';
import Collaborator from '@models/Collaborators';
import CollaboratorsRepository from '@repositories/collaboratorRepository';

class CollaboratorsService {
  public async findCollaboratorByCellPhone(
    cell_phone: string,
  ): Promise<Collaborator | null> {
    const collaboratorRepository: CollaboratorsRepository = getCustomRepository(
      CollaboratorsRepository,
    );

    const collaborator = await collaboratorRepository.findCollaboratorByCellPhone(
      cell_phone,
    );

    if (!collaborator) {
      return null;
    }

    return collaborator;
  }

  public async findCollaboratorByCellPhoneBlocked(
    cell_phone: string,
  ): Promise<Collaborator | null> {
    const collaboratorRepository: CollaboratorsRepository = getCustomRepository(
      CollaboratorsRepository,
    );

    const collaborator = await collaboratorRepository.findCollaboratorByCellPhoneBlocked(
      cell_phone,
    );

    if (!collaborator) {
      return null;
    }

    return collaborator;
  }

  public async execute(
    collaboratorDTO: CollaboratorDTO,
  ): Promise<Collaborator> {
    const collaboratorRepository: CollaboratorsRepository = getCustomRepository(
      CollaboratorsRepository,
    );

    const collaborator = collaboratorRepository.create({
      company: collaboratorDTO.company_id,
      re: collaboratorDTO.re,
      name: collaboratorDTO.name,
      cell_phone: collaboratorDTO.phone,
      is_enable: true,
    });

    if (collaboratorDTO.email) {
      collaborator.email = collaboratorDTO.email;
    }

    await collaboratorRepository.save(collaborator);

    return collaborator;
  }

  public async update(collaborator: Collaborator): Promise<void> {
    const collaboratorRepository: CollaboratorsRepository = getCustomRepository(
      CollaboratorsRepository,
    );
    await collaboratorRepository.save(collaborator);
  }
}

export default CollaboratorsService;
