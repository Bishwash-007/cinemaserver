export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = statusCode >= 400 && statusCode < 600;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const formatErrorPayload = (err) => ({
  success: false,
  message: err.message || 'Unexpected error',
  statusCode: err.statusCode || 500,
  details: err.details || null,
});

export const buildExpressErrorHandler = (logger) => (err, _req, res, _next) => {
  const appError = err instanceof AppError 
    ? err 
    : new AppError(err.message || 'Internal Server Error', err.statusCode || 500);

  if (!appError.isOperational && logger) {
    logger.error(err);
  }

  const payload = formatErrorPayload(appError);
  res.status(payload.statusCode).json(payload);
};