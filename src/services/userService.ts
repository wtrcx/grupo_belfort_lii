import { getCustomRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import UserRepository from '@repositories/userRepository';
import ProfileRepository from '@repositories/profileRepository';

import Profile from '@models/Profile';
import User from '@models/User';

import UserDTO from '@dtos/userDto';

class UserService {
  public async execute({
    name,
    email,
    cell_phone,
    password,
    password_confirmation,
    profile_id,
  }: UserDTO): Promise<User> {
    const userRepository: UserRepository = getCustomRepository(UserRepository);

    const profileRepository: ProfileRepository = getCustomRepository(
      ProfileRepository,
    );

    if (!name) {
      throw new Error('The following data is mandatory: name');
    }

    if (!email) {
      throw new Error('The following data is mandatory: email');
    }

    if (!cell_phone) {
      throw new Error('The following data is mandatory: cell_phone');
    }

    if (!password) {
      throw new Error('The following data is mandatory: password');
    }

    if (!password_confirmation) {
      throw new Error('The following data is mandatory: password_confirmation');
    }

    if (!profile_id) {
      throw new Error('The following data is mandatory: profile []');
    }

    if (profile_id.length === 0) {
      if (email !== 'wxavier@belfort.com.br') {
        throw new Error('The profile list cannot be empty');
      } else {
        const administrator: Profile = await profileRepository.findByAdminstrator();
        profile_id.push(administrator.id);
      }
    }

    const checkUsersExists = await userRepository.findOne({ where: { email } });

    if (checkUsersExists) {
      throw new Error('A user already exists with this email');
    }

    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    try {
      const profile = await profileRepository.findByIds(profile_id);

      const user = await userRepository.create({
        name,
        email,
        profile,
        cell_phone,
        password: await hash(password, 8),
      });

      await userRepository.save(user);

      delete user.password;
      delete user.profile;

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }
}

export default UserService;
