import AppError from './appError';

class ServerError extends AppError {
  constructor(message: string) {
    super(500, message);
  }
}

export default ServerError;
