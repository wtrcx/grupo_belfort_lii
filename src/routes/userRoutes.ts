import { Router } from 'express';

import UserService from '@services/userService';

import UserDTO from '@dtos/userDto';

const userService = new UserService();

const userRoutes = Router();

userRoutes.post('/', async (request, response) => {
  try {
    const userDTO: UserDTO = request.body;

    const user = await userService.execute(userDTO);

    return response.status(201).json(user);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

export default userRoutes;
