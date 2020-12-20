import ServerError from '@errors/serverError';
import { EntityRepository, Repository } from 'typeorm';
import Role from '@models/Role';

@EntityRepository(Role)
class RoleRepository extends Repository<Role> {
  public async findByIdsAndValidateEachOne(
    role_id: string[],
  ): Promise<Role[] | null> {
    const rolesIsValid = role_id.every(role =>
      this.findOne({ where: { id: role } }),
    );

    if (!rolesIsValid) {
      return null;
    }

    const roles = await this.findByIds(role_id);

    return roles;
  }

  public async findByAdminstrator(): Promise<Role> {
    const role = await this.findOne({ where: { name: 'administrator' } });

    if (!role) {
      throw new ServerError('Internal server error');
    }

    return role;
  }
}

export default RoleRepository;
