import { StatusCodes as httpStatus } from "http-status-codes";
import { generateToken } from "./jwt";
import { IUser } from "../modules/user/user.interface";
import { envVars } from "../config/env";
import AppError from "../helpers/AppError";
export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES,
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES,
  );
  return { accessToken, refreshToken };
};
export const ensureActiveUser = (user: { active: boolean } | null) => {
  if (!user)
    throw new AppError(httpStatus.BAD_REQUEST, "Account does not exist");
  if (!user.active)
    throw new AppError(httpStatus.BAD_REQUEST, "Account is deactivated");
};
