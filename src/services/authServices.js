import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as userRepo from '../repositories/userRepository.js';
import { jwtToken } from '../utils/jwt.js';
import { AppError } from '../utils/error.js';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const BCRYPT_ROUNDS = 12;

export const register = async ({ name, email, password, age, phoneNumber }) => {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(
    Date.now() + VERIFICATION_TOKEN_TTL_MS
  );

  const user = await userRepo.createUser({
    name,
    email,
    password: hashedPassword,
    age,
    phoneNumber,
    verificationToken,
    verificationTokenExpires,
  });

  const token = jwtToken.sign({
    id: user.id,
    role: user.role,
    email: user.email,
  });
  return { user, token, verificationToken };
};

export const login = async ({ email, password }) => {
  const row = await userRepo.findUserByEmail(email);

  if (!row) {
    throw new AppError('Invalid email or password', 401);
  }

  if (row.deletedAt) {
    throw new AppError('Account has been deactivated', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, row.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwtToken.sign({ id: row.id, role: row.role, email: row.email });

  const safeUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    age: row.age,
    phoneNumber: row.phoneNumber,
    profileImageUrl: row.profileImageUrl,
    isVerified: row.isVerified,
    customerExternalId: row.customerExternalId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  return { user: safeUser, token };
};

export const verifyEmail = async ({ token }) => {
  const user = await userRepo.findUserByVerificationToken(token);

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  if (user.verificationTokenExpires < new Date()) {
    throw new AppError('Verification token has expired', 400);
  }

  await userRepo.updateUserUnsafe(user.id, {
    isVerified: true,
    verificationToken: null,
    verificationTokenExpires: null,
    updatedAt: new Date(),
  });

  return { message: 'Email verified successfully' };
};

export const forgotPassword = async ({ email }) => {
  const user = await userRepo.findUserByEmail(email);

  if (!user) {
    return { message: 'If that email exists, a reset link has been sent' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await userRepo.updateUserUnsafe(user.id, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: resetExpires,
    updatedAt: new Date(),
  });

  return {
    message: 'If that email exists, a reset link has been sent',
    resetToken,
  };
};

export const resetPassword = async ({ token, password }) => {
  const user = await userRepo.findUserByResetToken(token);

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  if (user.resetPasswordExpires < new Date()) {
    throw new AppError('Reset token has expired', 400);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await userRepo.updateUserUnsafe(user.id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    updatedAt: new Date(),
  });

  return { message: 'Password reset successfully' };
};
