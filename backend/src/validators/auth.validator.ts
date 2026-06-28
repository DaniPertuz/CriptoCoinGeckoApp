import { z } from 'zod';

const register = {
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    password: z.string().min(8).max(72),
  }),
};

const login = {
  body: z.object({
    email: z.string().trim().email().max(120),
    password: z.string().min(8).max(72),
  }),
};

const googleLogin = {
  body: z.object({
    idToken: z.string().min(10),
  }),
};

export {
  register,
  login,
  googleLogin,
};
