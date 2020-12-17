import { EntityRepository, Repository } from 'typeorm';
import Profile from '../models/Profile';

@EntityRepository(Profile)
class ProfileRepository extends Repository<Profile> {
  public async findByAdminstrator(): Promise<Profile> {
    const profile = await this.findOne({ where: { name: 'administrator' } });

    if (!profile) {
      throw new Error('Application error. Contact your administrator');
    }

    return profile;
  }
}

export default ProfileRepository;
