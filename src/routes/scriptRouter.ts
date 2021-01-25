import ScriptService from '@services/scriptService';
import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const scriptRoutes = Router();

scriptRoutes.get(
  '/',
  ensureAuthenticated(['administrator']),
  async (request, response) => {
    const scripts = ScriptService.list();

    return response.status(200).json(scripts);
  },
);

export default scriptRoutes;
