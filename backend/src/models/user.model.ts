import { NewUser, SafeUser, User, UserProvider, UserRole } from '../types/user';

interface CreateUserModelInput {
  id?: string;
  name: string;
  email: string;
  passwordHash: string | null;
  provider?: UserProvider;
  googleId?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const createUserModel = ({
  id,
  name,
  email,
  passwordHash,
  provider = UserProvider.PASSWORD,
  googleId = null,
  avatarUrl = null,
  role = UserRole.USER,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}: CreateUserModelInput): NewUser => ({
  id,
  name: name.trim(),
  email: normalizeEmail(email),
  passwordHash,
  provider,
  googleId,
  avatarUrl,
  role,
  createdAt,
  updatedAt,
});

const sanitizeUser = (user: User): SafeUser => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export {
  createUserModel,
  normalizeEmail,
  sanitizeUser,
};
