import express, { Router } from 'express';

import path from 'path';

import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import sessionRoutes from './sessionRoutes';
import whatsappRoute from './whatsappRoutes';
import conversationRoutes from './conversationRoutes';
import scriptRoutes from './scriptRouter';
import intentRoutes from './intentRoutes';

const routes = Router();

routes.use('/sessions', sessionRoutes);

routes.use('/users', userRoutes);

routes.use('/profiles', profileRoutes);

routes.use('/whatsapp', whatsappRoute);

routes.use('/conversations', conversationRoutes);

routes.use('/scripts', scriptRoutes);

routes.use('/intents', intentRoutes);

routes.use(express.static(path.join(__dirname, '..', '..', '/public')));

export default routes;
