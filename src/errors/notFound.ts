import AppError from './appError';

class NotFound extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

export default NotFound;
