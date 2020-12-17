import ProfileDTO from '@dtos/profileDto';
import Profile from '@models/Profile';
import Role from '@models/Role';
import ProfileRepository from '@repositories/profileRepository';
import { getCustomRepository } from 'typeorm';

class ProfileService {
  public async getAllProfileWithRoles(): Promise<Profile[]> {
    const profileRepository = getCustomRepository(ProfileRepository);

    const profilesList = await profileRepository.find({ relations: ['roles'] });

    return profilesList;
  }

  public async getRolesByProfiles(profiles: Profile[]): Promise<Set<Role>> {
    const profileRepository = getCustomRepository(ProfileRepository);

    const listRoles: Set<Role> = new Set();

    const profilesList = await profileRepository.findByIds(
      profiles.map(profile => profile.id),
      {
        relations: ['roles'],
      },
    );

    profilesList.map(profile => profile.roles.map(role => listRoles.add(role)));

    return listRoles;
  }

  public async execute({
    name,
    alias,
    description,
  }: ProfileDTO): Promise<Profile> {
    const profileRepository = getCustomRepository(ProfileRepository);

    if (!name) {
      throw new Error('The following data is mandatory: name');
    }
    if (!alias) {
      throw new Error('The following data is mandatory: alias');
    }
    if (!description) {
      throw new Error('The following data is mandatory: description');
    }

    const profile = profileRepository.create({
      name,
      alias,
      description,
    });

    await profileRepository.save(profile);

    return profile;
  }
}
export default ProfileService;
