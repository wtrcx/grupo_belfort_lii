import { Router, Request, Response } from 'express';

import userRoutes from '@routes/userRoutes';
import profileRoutes from '@routes/profileRoutes';
import sessionRoutes from '@routes/sessionRoutes';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const routes = Router();

routes.use('/users', userRoutes);
routes.use('/sessions', sessionRoutes);
routes.use('/profiles', profileRoutes);

routes.use(
  '/scripts',
  ensureAuthenticated(['administrator']),
  (request: Request, response: Response) => {
    return response.json({ message: 'ok' });
  },
);

export default routes;
