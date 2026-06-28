import { z } from 'zod';

const idParam = {
  params: z.object({
    id: z.string().trim().min(1),
  }),
};

const listUsers = {
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
};

const createUser = {
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120),
    password: z.string().min(8).max(72),
    role: z.enum(['user', 'admin']).default('user'),
  }),
};

const updateUser = {
  params: idParam.params,
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      email: z.string().trim().email().max(120).optional(),
      password: z.string().min(8).max(72).optional(),
      role: z.enum(['user', 'admin']).optional(),
      avatarUrl: z.string().url().nullable().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field is required',
    }),
};

export {
  idParam,
  listUsers,
  createUser,
  updateUser,
};
