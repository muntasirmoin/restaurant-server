import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";
import { envVars } from "./app/config/env";
import app from "./app";
import { gracefulShutdown } from "./app/utils/gracefulShutdown";
import { seedAdmin } from "./app/utils/seedAdmin";
import { initSocket } from "./app/sockets";
let server: HttpServer;
const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to Restaurant DataBase!");
    const httpServer = new HttpServer(app);
    const io = new SocketServer(httpServer, {
      cors: { origin: envVars.FRONTEND_URL, credentials: true },
    });
    initSocket(io);
    server = httpServer.listen(envVars.PORT, () => {
      console.log(`Restaurant Server is listening on port: ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
(async () => {
  await startServer();
  await seedAdmin();
})();

process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection detected... server shutting down..:", err);
  gracefulShutdown(server, 1);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception Detected! server shutting down!!!", err);
  gracefulShutdown(server, 1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM Signal Received! server shutting down!!!");
  gracefulShutdown(server, 0);
});

process.on("SIGINT", () => {
  console.log("SIGINT Signal Received! Server Shutting down gracefully.!!!");
  gracefulShutdown(server, 0);
});
