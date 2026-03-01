import bcrypt from 'bcryptjs';
import * as userRepo from '../repositories/userRepository.js';
import { AppError } from '../utils/error.js';

const BCRYPT_ROUNDS = 12;

export const getMe = async userId => {
  const user = await userRepo.findUserSafeById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const updateProfile = async (userId, { name, age, phoneNumber }) => {
  const updated = await userRepo.updateUser(userId, {
    name,
    age,
    phoneNumber,
    updatedAt: new Date(),
  });
  if (!updated) {
    throw new AppError('User not found', 404);
  }
  return updated;
};

export const changePassword = async (
  userId,
  { currentPassword, newPassword }
) => {
  const user = await userRepo.findUserById(userId);
  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await userRepo.updateUserUnsafe(userId, {
    password: hashed,
    updatedAt: new Date(),
  });

  return { message: 'Password changed successfully' };
};

export const deleteAccount = async userId => {
  await userRepo.softDeleteUser(userId);
  return { message: 'Account deleted successfully' };
};

export const getAllUsers = async ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const users = await userRepo.findAllUsers({ limit, offset });
  return { users, page, limit };
};

export const updateUserRole = async (userId, { role }) => {
  const updated = await userRepo.updateUser(userId, {
    role,
    updatedAt: new Date(),
  });
  if (!updated) {
    throw new AppError('User not found', 404);
  }
  return updated;
};
