import { Router } from 'express';
import SessionService from '@services/sessionService';

const sessionRoutes = Router();

const sessionService = new SessionService();

sessionRoutes.post('/', async (request, response) => {
  try {
    const { email, password } = request.body;

    const login = await sessionService.execute({ email, password });

    return response.status(201).json(login);
  } catch (error) {
    return response.status(401).json({ error: error.message });
  }
});

export default sessionRoutes;
