import * as authServices from '../services/authServices.js';
import { cookies } from '../utils/cookie.js';

export const register = async (req, res, next) => {
  try {
    const { user, token, verificationToken } = await authServices.register(
      req.body
    );
    cookies.set(res, 'token', token);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: { user },
      ...(process.env.NODE_ENV !== 'production' && { verificationToken }),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authServices.login(req.body);
    cookies.set(res, 'token', token);
    res.status(200).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req, res) => {
  cookies.clear(res, 'token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const verifyEmail = async (req, res, next) => {
  try {
    const result = await authServices.verifyEmail(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authServices.forgotPassword(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authServices.resetPassword(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
