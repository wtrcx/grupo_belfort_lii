import ConversationsService from '@services/conversationService';
import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const conversationRoutes = Router();

conversationRoutes.get(
  '/',
  ensureAuthenticated(['administrator', 'conversation_consult']),
  async (request, response) => {
    const conversationsService = new ConversationsService();

    const conversations = await conversationsService.getAllHistoric();

    return response.status(200).json(conversations);
  },
);

export default conversationRoutes;
