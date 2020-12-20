abstract class AppError {
  private readonly status: number;

  private readonly message: string;

  private readonly timestamp: number;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
    this.timestamp = new Date().getTime();
  }
}

export default AppError;
