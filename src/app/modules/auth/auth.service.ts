import { StatusCodes as httpStatus } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import User from "../user/user.model";
import AppError from "../../helpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { verifyToken, generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";

const login = async (username: string, password: string) => {
  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  if (!user.active)
    throw new AppError(httpStatus.UNAUTHORIZED, "Account is deactivated");

  const match = await user.comparePassword(password);

  if (!match)
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");

  const tokens = createUserTokens(user);
  return {
    tokens,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  const verified = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET,
  ) as JwtPayload;

  const user = await User.findOne({ username: verified.username });

  if (!user)
    throw new AppError(httpStatus.BAD_REQUEST, "Account does not exist");
  if (!user.active)
    throw new AppError(httpStatus.BAD_REQUEST, "Account is deactivated");

  const jwtPayload = {
    userId: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  return generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES,
  );
};
export const AuthServices = { login, refreshAccessToken };
