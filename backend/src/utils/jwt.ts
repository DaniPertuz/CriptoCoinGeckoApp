import jwt, { type SignOptions } from 'jsonwebtoken';

import env from '../config/env';
import type { AuthTokenPayload, User } from '../types/user';

const signUserToken = (user: User): string => {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwt.secret,
    options,
  );
};

const verifyToken = (token: string): AuthTokenPayload => jwt.verify(token, env.jwt.secret) as AuthTokenPayload;

export {
  signUserToken,
  verifyToken,
};
