import { Router } from 'express';

import UserService from '@services/userService';

import UserDTO from '@dtos/userDto';

const userService = new UserService();

const userRoutes = Router();

userRoutes.post('/', async (request, response) => {
  const userDTO: UserDTO = request.body;

  const user = await userService.execute(userDTO);

  return response.status(201).json(user);
});

export default userRoutes;
