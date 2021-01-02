import { google } from 'googleapis';

import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const googleRoutes = Router();

// const clientId
// const secret

googleRoutes.get(
  '/',
  ensureAuthenticated(['administrator']),
  async (request, response) => {
    console.log(request);
    console.log(response);
    console.log(google);
  },
);

export default googleRoutes;
