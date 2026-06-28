import bcrypt from 'bcryptjs';

import env from '../config/env';

const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, env.bcrypt.saltRounds);

const comparePassword = (password: string, passwordHash: string): Promise<boolean> =>
  bcrypt.compare(password, passwordHash);

export {
  hashPassword,
  comparePassword,
};
