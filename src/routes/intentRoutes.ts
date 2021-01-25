import IntentService from '@services/intentService';
import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const intentRoutes = Router();

intentRoutes.get(
  '/',
  ensureAuthenticated(['administrator']),
  async (request, response) => {
    const intents = await IntentService.init();

    return response.status(200).json(intents);
  },
);

intentRoutes.post(
  '/',
  ensureAuthenticated(['administrator']),
  async (request, response) => {
    const { script, intent, utterances, answers } = request.body;

    await IntentService.execute({
      script,
      intent,
      utterances,
      answers,
      user: request.user.id,
    });

    return response.status(201).json({
      message: 'Intent successfully created',
    });
  },
);

export default intentRoutes;
