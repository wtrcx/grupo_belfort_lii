import ProfileService from '@services/profileService';
import { Router } from 'express';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const profileRoutes = Router();

profileRoutes.get(
  '/',
  ensureAuthenticated(['administrator', 'profile.consult']),
  async (request, response) => {
    const profileService = new ProfileService();

    try {
      const profiles = await profileService.getAllProfileWithRoles();

      return response.status(200).json(profiles);
    } catch {
      return response.status(500).json({
        message: 'message: Error on the server, consult the administrator!',
      });
    }
  },
);

profileRoutes.post(
  '/',
  ensureAuthenticated(['administrator', 'profile.create']),
  async (request, response) => {
    try {
      const { alias, name, description } = request.body;

      const profileService = new ProfileService();

      const profile = await profileService.execute({
        alias,
        name,
        description,
      });
      return response.status(201).json(profile);
    } catch (error) {
      return response.status(401).json(error.message);
    }
  },
);

export default profileRoutes;
