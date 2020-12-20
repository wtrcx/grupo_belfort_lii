import BadRequest from '@errors/badRequest';
import ServerError from '@errors/serverError';
import Unauthorized from '@errors/unauthorizedError';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

interface Subject {
  id: string;
  roles: string[];
}

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new ServerError('Error in environment variables');
}

const ensureAuthenticated = (checkRoles?: string[]) => (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const administrator = process.env.APP_ADMINISTRATOR;

  if (!administrator) {
    throw new ServerError('Internal server error');
  }

  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new BadRequest('JWT token is misssing');
  }

  const [, token] = authHeader.split(' ');

  try {
    const decode = verify(token, secret);

    const { sub } = decode as TokenPayload;

    const { id, roles } = JSON.parse(sub) as Subject;

    if (checkRoles) {
      if (!checkRoles.some(checkProfile => roles.includes(checkProfile))) {
        throw new Unauthorized('Not Authorized');
      }
    }

    request.user = {
      id,
      roles,
    };

    return next();
  } catch (error) {
    throw new ServerError(error);
  }
};

export default ensureAuthenticated;
