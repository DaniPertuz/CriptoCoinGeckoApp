import AppError from '../utils/AppError';
import * as userRepository from '../repositories/user.repository';
import { getFirebaseAuth } from '../config/firebase';
import { comparePassword, hashPassword } from '../utils/password';
import { signUserToken } from '../utils/jwt';
import { createUserModel, normalizeEmail, sanitizeUser } from '../models/user.model';
import { UserProvider, type AuthResponse, type GoogleLoginPayload, type LoginPayload, type RegisterPayload, type User } from '../types/user';

const buildAuthResponse = (user: User): AuthResponse => ({
  user: sanitizeUser(user),
  token: signUserToken(user),
});

const register = async ({ name, email, password }: RegisterPayload): Promise<AuthResponse> => {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError('Email is already registered', 409, 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await hashPassword(password);
  const user = createUserModel({
    name,
    email,
    passwordHash,
    provider: UserProvider.PASSWORD,
  });

  const createdUser = await userRepository.create(user);
  return buildAuthResponse(createdUser);
};

const login = async ({ email, password }: LoginPayload): Promise<AuthResponse> => {
  const user = await userRepository.findByEmail(email);

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  return buildAuthResponse(user);
};

const loginWithGoogle = async ({ idToken }: GoogleLoginPayload): Promise<AuthResponse> => {
  const decodedToken = await getFirebaseAuth().verifyIdToken(idToken);
  const email = decodedToken.email;

  if (!email) {
    throw new AppError('Google account must include an email', 400, 'GOOGLE_EMAIL_REQUIRED');
  }

  const googleId = decodedToken.uid;
  const existingByGoogleId = await userRepository.findByGoogleId(googleId);
  const existingByEmail = existingByGoogleId || (await userRepository.findByEmail(email));

  if (existingByEmail) {
    const updatedUser = await userRepository.update(existingByEmail.id, {
      googleId,
      provider: existingByEmail.provider === UserProvider.PASSWORD ? UserProvider.PASSWORD_GOOGLE : UserProvider.GOOGLE,
      avatarUrl: decodedToken.picture || existingByEmail.avatarUrl || null,
    });

    return buildAuthResponse(updatedUser);
  }

  const user = createUserModel({
    name: decodedToken.name || normalizeEmail(email).split('@')[0],
    email,
    passwordHash: null,
    provider: UserProvider.GOOGLE,
    googleId,
    avatarUrl: decodedToken.picture || null,
  });

  const createdUser = await userRepository.create(user);
  return buildAuthResponse(createdUser);
};

const getProfile = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('Authenticated user no longer exists', 401, 'AUTH_USER_NOT_FOUND');
  }

  return sanitizeUser(user);
};

export {
  register,
  login,
  loginWithGoogle,
  getProfile,
};
