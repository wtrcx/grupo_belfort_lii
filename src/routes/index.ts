import { Router, Request, Response } from 'express';

import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import sessionRoutes from './sessionRoutes';
import whatsappRoute from './whatsappRoutes';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const routes = Router();

routes.use('/sessions', sessionRoutes);

routes.use('/users', userRoutes);

routes.use('/profiles', profileRoutes);

routes.use('/whatsapp', whatsappRoute);

routes.use(
  '/clients',
  ensureAuthenticated(['administrator']),
  (request: Request, response: Response) => {
    return response.json({ message: 'ok' });
  },
);

export default routes;
