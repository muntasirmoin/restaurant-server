import { Response } from "express";
import { envVars } from "../config/env";
export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}
const isProduction = envVars.NODE_ENV === "production";
export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  };
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, cookieOptions);
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, cookieOptions);
  }
};
