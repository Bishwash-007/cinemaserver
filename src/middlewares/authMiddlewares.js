import { jwtToken } from '../utils/jwt.js';
import { AppError } from '../utils/error.js';

export const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    const token = tokenFromHeader || req.cookies?.token;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize =
  (...roles) =>
    (req, _res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(new AppError('Forbidden: insufficient permissions', 403));
      }
      next();
    };

export const validate = schema => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(
      new AppError('Validation failed', 422, result.error.flatten().fieldErrors)
    );
  }
  req.body = result.data;
  next();
};

export const validateQuery = schema => (req, _res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(
      new AppError(
        'Invalid query parameters',
        422,
        result.error.flatten().fieldErrors
      )
    );
  }
  req.query = result.data;
  next();
};
