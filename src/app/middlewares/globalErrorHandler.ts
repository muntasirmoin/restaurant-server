/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { handlerDuplicateError } from "../helpers/handleDuplicateError";
import { handlerValidationError } from "../helpers/handlerValidationError";
import { handlerZodError } from "../helpers/handlerZodError";
import { TErrorSources } from "../interfaces/error.types";
import AppError from "../helpers/AppError";
import { handleCastError } from "../helpers/handleCastError";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development")
    console.log("globalErrorHandler:", err);
  let errorSources: TErrorSources[] = [];
  let statusCode = 500;
  let message = "Something Went Wrong!!";
  if (err.code === 11000) {
    const s = handlerDuplicateError(err);
    statusCode = s.statusCode;
    message = s.message;
  } else if (err.name === "CastError") {
    const s = handleCastError(err);
    statusCode = s.statusCode;
    message = s.message;
  } else if (err.name === "ZodError") {
    const s = handlerZodError(err);
    statusCode = s.statusCode;
    message = s.message;
    errorSources = s.errorSources as TErrorSources[];
  } else if (err.name === "ValidationError") {
    const s = handlerValidationError(err);
    statusCode = s.statusCode;
    errorSources = s.errorSources as TErrorSources[];
    message = s.message;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
