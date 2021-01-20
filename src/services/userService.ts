import { getCustomRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import UserRepository from '@repositories/userRepository';

import User from '@models/User';

import UserDTO from '@dtos/userDTO';
import BadRequest from '@errors/badRequest';
import RoleRepository from '@repositories/roleRepository';
import ServerError from '@errors/serverError';

class UserService {
  public async execute({
    name,
    email,
    password,
    role_id,
  }: UserDTO): Promise<User> {
    const userRepository: UserRepository = getCustomRepository(UserRepository);

    const roleRepository: RoleRepository = getCustomRepository(RoleRepository);

    const administrator = process.env.APP_ADMINISTRATOR;

    if (!administrator) {
      throw new ServerError('Internal server error');
    }

    if (!name) {
      throw new BadRequest('The following data is mandatory: name');
    }

    if (!email) {
      throw new BadRequest('The following data is mandatory: email');
    }

    const regexEmail = new RegExp(
      '^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\\.[a-zA-Z]+\\.?([a-zA-Z]+)?$',
    );

    if (!regexEmail.test(email)) {
      throw new BadRequest('The following data is mandatory: email');
    }

    if (!password) {
      throw new BadRequest('The following data is mandatory: password');
    }

    const regexPassword = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])[A-Za-z\\d@#$!%*?&]{8,15}$',
    );

    if (!regexPassword.test(password)) {
      throw new BadRequest(
        'The password does not meet our security policy:' +
          'Minimum eight and maximum 15 characters, at least' +
          ' one uppercase letter, one lowercase letter, one ' +
          'number and one special character',
      );
    }

    const checkUsersExists = await userRepository.findOne({ where: { email } });

    if (checkUsersExists) {
      throw new BadRequest('A user already exists with this email');
    }

    if (!role_id) {
      throw new BadRequest('The following data is mandatory: role_id []');
    }

    if (!Array.isArray(role_id)) {
      throw new BadRequest('The following data is mandatory: role_id []');
    }

    if (role_id.length === 0) {
      if (email !== administrator) {
        throw new BadRequest('The role list cannot be empty');
      }
      const roleAdministrator = await roleRepository.findByAdminstrator();
      role_id.push(roleAdministrator.id);
    }

    const roles = await roleRepository.findByIdsAndValidateEachOne(role_id);

    if (!roles) {
      throw new BadRequest('One or more roles will not be found');
    }

    const user = userRepository.create({
      name,
      email,
      roles,
      password: await hash(password, 10),
    });

    await userRepository.save(user);

    delete user.password;
    delete user.roles;

    return user;
  }
}

export default UserService;
