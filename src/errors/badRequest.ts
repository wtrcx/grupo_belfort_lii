import AppError from './appError';

class BadRequest extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export default BadRequest;
