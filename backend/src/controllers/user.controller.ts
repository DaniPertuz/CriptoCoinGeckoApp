import asyncHandler from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import * as userService from '../services/user.service';

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, user, 201);
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers(req.query);
  return sendSuccess(res, users, 200, { count: users.length });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return sendSuccess(res, user);
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  return res.status(204).send();
});

export {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
