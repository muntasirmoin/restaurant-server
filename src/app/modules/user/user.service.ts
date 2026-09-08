import { StatusCodes as httpStatus } from "http-status-codes";
import User from "./user.model";
import AppError from "../../helpers/AppError";
import { IUser, UserRole } from "./user.interface";
const listUsers = async () =>
  User.find().select("-password").sort({ role: 1, name: 1 });

const createUser = async (
  payload: Pick<IUser, "name" | "username" | "password" | "role">,
) => {
  const exists = await User.findOne({
    username: payload.username.toLowerCase(),
  });
  if (exists) throw new AppError(httpStatus.CONFLICT, "Username already taken");
  const user = await User.create(payload);
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
  };
};
const updateUser = async (
  id: string,
  payload: Partial<{
    name: string;
    role: UserRole;
    active: boolean;
    password: string;
  }>,
) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (payload.name) user.name = payload.name;
  if (payload.role) user.role = payload.role;
  if (typeof payload.active === "boolean") user.active = payload.active;
  if (payload.password) user.password = payload.password;
  await user.save();
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
    active: user.active,
  };
};
export const UserServices = { listUsers, createUser, updateUser };
