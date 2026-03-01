import { eq, isNull, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { usersTable } from '../models/user.js';

export const USER_SAFE_FIELDS = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  role: usersTable.role,
  age: usersTable.age,
  phoneNumber: usersTable.phoneNumber,
  profileImageUrl: usersTable.profileImageUrl,
  isVerified: usersTable.isVerified,
  customerExternalId: usersTable.customerExternalId,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
};

export const findUserByEmail = async email =>
  db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then(([row]) => row ?? null);

export const findUserById = async id =>
  db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .then(([row]) => row ?? null);

export const findUserSafeById = async id =>
  db
    .select(USER_SAFE_FIELDS)
    .from(usersTable)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)))
    .then(([row]) => row ?? null);

export const findUserByVerificationToken = async token =>
  db
    .select()
    .from(usersTable)
    .where(eq(usersTable.verificationToken, token))
    .then(([row]) => row ?? null);

export const findUserByResetToken = async token =>
  db
    .select()
    .from(usersTable)
    .where(eq(usersTable.resetPasswordToken, token))
    .then(([row]) => row ?? null);

export const createUser = async data =>
  db
    .insert(usersTable)
    .values(data)
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isVerified: usersTable.isVerified,
    })
    .then(([row]) => row);

export const updateUser = async (id, data) =>
  db
    .update(usersTable)
    .set(data)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)))
    .returning(USER_SAFE_FIELDS)
    .then(([row]) => row ?? null);

export const updateUserUnsafe = async (id, data) =>
  db.update(usersTable).set(data).where(eq(usersTable.id, id));

export const softDeleteUser = async id =>
  db
    .update(usersTable)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(usersTable.id, id));

export const findAllUsers = async ({ limit, offset }) =>
  db
    .select(USER_SAFE_FIELDS)
    .from(usersTable)
    .where(isNull(usersTable.deletedAt))
    .limit(limit)
    .offset(offset);
