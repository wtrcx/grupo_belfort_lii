import AppError from './appError';

class Unauthorized extends AppError {
  constructor(message: string) {
    super(401, message);
  }
}

export default Unauthorized;
