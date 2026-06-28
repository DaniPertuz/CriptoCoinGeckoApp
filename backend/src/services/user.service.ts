import AppError from '../utils/AppError';
import * as userRepository from '../repositories/user.repository';
import { createUserModel, sanitizeUser } from '../models/user.model';
import { hashPassword } from '../utils/password';
import type { CreateUserPayload, ListUsersQuery, SafeUser, UpdateUserPayload, UserUpdateData } from '../types/user';
import { UserProvider, UserRole } from '../types/user';

const ensureEmailIsAvailable = async (email?: string, currentUserId: string | null = null): Promise<void> => {
  if (!email) {
    return;
  }

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser && existingUser.id !== currentUserId) {
    throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
  }
};

const createUser = async ({ name, email, password, role = UserRole.USER }: CreateUserPayload): Promise<SafeUser> => {
  await ensureEmailIsAvailable(email);

  const passwordHash = await hashPassword(password);
  const user = createUserModel({
    name,
    email,
    passwordHash,
    role,
    provider: UserProvider.PASSWORD,
  });

  const createdUser = await userRepository.create(user);
  return sanitizeUser(createdUser);
};

const listUsers = async ({ limit }: ListUsersQuery): Promise<SafeUser[]> => {
  const users = await userRepository.list({ limit });
  return users.map(sanitizeUser);
};

const getUserById = async (id: string): Promise<SafeUser> => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

const updateUser = async (id: string, payload: UpdateUserPayload): Promise<SafeUser> => {
  const currentUser = await userRepository.findById(id);

  if (!currentUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await ensureEmailIsAvailable(payload.email, id);

  const updatePayload: UserUpdateData & { password?: string } = {
    ...payload,
  };

  if (payload.password) {
    updatePayload.passwordHash = await hashPassword(payload.password);
    delete updatePayload.password;
  }

  const updatedUser = await userRepository.update(id, updatePayload);
  return sanitizeUser(updatedUser);
};

const deleteUser = async (id: string): Promise<void> => {
  const currentUser = await userRepository.findById(id);

  if (!currentUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await userRepository.remove(id);
};

export {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
