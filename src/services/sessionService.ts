import { getCustomRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import LoginDTO from '@dtos/loginDto';
import UserRepository from '@repositories/userRepository';
import Role from '@models/Role';
import authConfig from '../config/auth';
import ProfileService from './profileService';

interface LoginSuccess {
  name: string;
  email: string;
  token: string;
}

interface TokenPayload {
  id: string;
  roles: string[]; // string[];
}

class SessionService {
  public async execute({ email, password }: LoginDTO): Promise<LoginSuccess> {
    const userRepository: UserRepository = getCustomRepository(UserRepository);

    const profileService = new ProfileService();

    const user = await userRepository.findOne({
      relations: ['profile'],
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Error('Invalid email or password');
    }

    const { secret, expiresIn } = authConfig.jwt;

    const roles = await profileService.getRolesByProfiles(user.profile);

    const rolesName = Array.from(roles).map(role => role.name);

    const tokenPayload: TokenPayload = { id: user.id, roles: rolesName };

    const token = sign({}, secret, {
      subject: JSON.stringify(tokenPayload),
      expiresIn,
    });

    delete user.password;
    delete user.profile;

    return {
      name: user.name,
      email: user.email,
      token,
    };
  }
}

export default SessionService;
