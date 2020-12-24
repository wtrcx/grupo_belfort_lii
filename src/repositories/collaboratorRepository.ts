import { EntityRepository, Repository } from 'typeorm';

import Collaborator from '@models/Collaborators';

@EntityRepository(Collaborator)
class CollaboratorsRepository extends Repository<Collaborator> {
  public async findCollaboratorByCellPhone(
    cell_phone: string,
  ): Promise<Collaborator | null> {
    const findCollaborator = await this.findOne({
      where: { cell_phone, is_enable: true },
    });

    if (!findCollaborator) {
      return null;
    }

    return findCollaborator;
  }

  public async findCollaboratorByCellPhoneBlocked(
    cell_phone: string,
  ): Promise<Collaborator | null> {
    const findCollaborator = await this.findOne({
      where: { cell_phone, is_enable: false },
    });
    if (!findCollaborator) {
      return null;
    }

    return findCollaborator;
  }
}

export default CollaboratorsRepository;
