import dotenv from "dotenv";
dotenv.config();

interface EnvInterface {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  ADMIN_NAME: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  FRONTEND_URL: string;
}
const loadEnvVariables = (): EnvInterface => {
  const requiredEnvironmentVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "ADMIN_NAME",
    "ADMIN_USERNAME",
    "ADMIN_PASSWORD",
    "FRONTEND_URL",
  ];
  requiredEnvironmentVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing Required Environment variable: ${key}`);
    }
  });
  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    ADMIN_NAME: process.env.ADMIN_NAME as string,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};
export const envVars = loadEnvVariables();
