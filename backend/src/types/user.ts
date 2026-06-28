import type { JwtPayload } from 'jsonwebtoken';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserProvider {
  PASSWORD = 'password',
  GOOGLE = 'google',
  PASSWORD_GOOGLE = 'password_google'
};

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  provider: UserProvider;
  googleId: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type NewUser = Omit<User, 'id'> & {
  id?: string;
};

export type SafeUser = Omit<User, 'passwordHash'>;

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  idToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthContext {
  token: string;
  payload: AuthTokenPayload;
  user: SafeUser;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  avatarUrl?: string | null;
}

export interface ListUsersQuery {
  limit?: number;
}

export type UserUpdateData = Partial<
  Pick<User, 'name' | 'email' | 'passwordHash' | 'role' | 'avatarUrl' | 'googleId' | 'provider'>
>;
