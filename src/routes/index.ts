import { Router } from 'express';

import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import sessionRoutes from './sessionRoutes';
import whatsappRoute from './whatsappRoutes';
import conversationRoutes from './conversationRoutes';

const routes = Router();

routes.use('/sessions', sessionRoutes);

routes.use('/users', userRoutes);

routes.use('/profiles', profileRoutes);

routes.use('/whatsapp', whatsappRoute);

routes.use('/conversations', conversationRoutes);

export default routes;
