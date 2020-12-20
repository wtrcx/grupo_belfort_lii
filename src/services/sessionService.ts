import { getCustomRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import LoginDTO from '@dtos/loginDto';
import UserRepository from '@repositories/userRepository';
import Unauthorized from '@errors/unauthorizedError';
import ServerError from '@errors/serverError';

interface SessionCreate {
  name: string;
  email: string;
  token: string;
}

interface TokenPayload {
  id: string;
  roles: string[];
}

class SessionService {
  public async execute({ email, password }: LoginDTO): Promise<SessionCreate> {
    const userRepository: UserRepository = getCustomRepository(UserRepository);

    const user = await userRepository.findOne({
      relations: ['roles'],
      where: { email },
    });

    if (!user) {
      throw new Unauthorized('Invalid email or password');
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new Unauthorized('Invalid email or password');
    }

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRESIN;

    if (!secret || !expiresIn) {
      throw new ServerError('Internal server error');
    }

    const roles = user.roles.map(role => role.name);

    const tokenPayload: TokenPayload = { id: user.id, roles };

    const token = sign({}, secret, {
      subject: JSON.stringify(tokenPayload),
      expiresIn,
    });

    return {
      name: user.name,
      email: user.email,
      token,
    };
  }
}

export default SessionService;
