import Profile from '@models/Profile';

import ProfileRepository from '@repositories/profileRepository';
import { getCustomRepository, Not } from 'typeorm';

class ProfileService {
  public async getAllProfileWithRoles(): Promise<Profile[]> {
    const profileRepository = getCustomRepository(ProfileRepository);

    const profilesList = await profileRepository.find({
      relations: ['roles'],
      where: { name: Not('administrator') },
    });

    return profilesList;
  }
}
export default ProfileService;
