import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { envVars } from "./app/config/env";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(cors({ origin: envVars.FRONTEND_URL, credentials: true }));

app.use("/api/v1", router);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message:
      "Restaurant Order Management System is running successfully. Welcome!",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
