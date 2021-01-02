import WhatsappService from '@services/whatsappService';
import express, { Router } from 'express';
import path from 'path';
import ensureAuthenticated from 'src/middlewares/ensureAuthenticated';

const whatsappRoute = Router();

const whatsappService = new WhatsappService();

whatsappRoute.post(
  '/',
  ensureAuthenticated(['administrator', 'whatsapp_create']),
  async (request, response) => {
    const { script } = request.body;
    const { host } = request.headers;
    const { id } = request.user;
    const whatsapp = await whatsappService.create(script, host, id);

    return response.status(201).json(whatsapp);
  },
);

whatsappRoute.post(
  '/:id',
  ensureAuthenticated(['administrator', 'whatsapp_create']),
  async (request, response) => {
    const { id } = request.params;
    await whatsappService.client(id);

    return response.status(201).json({
      status: true,
      message: 'Whatsapp is connected',
      timestamp: new Date().getTime(),
    });
  },
);

whatsappRoute.get(
  '/restart',
  ensureAuthenticated(['administrator', 'whatsapp_create']),
  async (request, response) => {
    whatsappService.restart();

    return response.status(201).json({
      status: true,
      message: 'Whatsapp is connected',
      timestamp: new Date().getTime(),
    });
  },
);

whatsappRoute.use(
  '/qr',
  express.static(path.resolve(__dirname, '..', 'tmp', 'whatsapp')),
);

export default whatsappRoute;
