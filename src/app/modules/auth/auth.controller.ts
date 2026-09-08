import { StatusCodes as httpStatus } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { AuthServices } from "./auth.service";

import { envVars } from "../../config/env";
const isProduction = envVars.NODE_ENV === "production";

export const login = catchAsync(async (req, res) => {
  const result = await AuthServices.login(req.body.username, req.body.password);
  setAuthCookie(res, result.tokens);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: { user: result.user },
  });
});
export const refreshToken = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  const accessToken =
    await AuthServices.refreshAccessToken(incomingRefreshToken);
  setAuthCookie(res, { accessToken });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New access token generated",
    data: null,
  });
});
export const logout = catchAsync(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  };
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});
export const me = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current user",
    data: req.user,
  });
});
