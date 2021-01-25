import ProfileService from '@services/profileService';
import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const profileRoutes = Router();

profileRoutes.get(
  '/',
  ensureAuthenticated(['administrator']),
  async (request, response) => {
    const profileService = new ProfileService();

    const profiles = await profileService.getAllProfileWithRoles();

    return response.status(200).json(profiles);
  },
);

export default profileRoutes;
