import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '../config/auth';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

interface Subject {
  id: string;
  roles: string[];
}

const { secret } = authConfig.jwt;

const ensureAuthenticated = (checkProfiles?: string[]) => (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new Error('JWT token is misssing');
  }

  const [, token] = authHeader.split(' ');

  try {
    const decode = verify(token, secret);

    const { sub } = decode as TokenPayload;

    const { id, roles } = JSON.parse(sub) as Subject;

    if (checkProfiles) {
      if (!checkProfiles.some(checkProfile => roles.includes(checkProfile))) {
        throw new Error('Not Authorized');
      }
    }

    request.user = {
      id,
      roles,
    };

    return next();
  } catch (error) {
    throw new Error(error);
  }
};

export default ensureAuthenticated;
