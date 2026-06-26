class AppError extends Error {
  constructor(message, statusCode = 500, expose = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

export { AppError };