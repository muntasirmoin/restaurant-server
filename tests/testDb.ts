import mongoose from "mongoose";
import dotenv from "dotenv";
import { Server as SocketServer } from "socket.io";
import { initSocket } from "../src/app/sockets";
dotenv.config();
const TEST_DB_URL = process.env.TEST_DB_URL;
export const connectTestDB = async () => {
  if (!TEST_DB_URL) {
    throw new Error(
      "TEST_DB_URL is not set in .env -- point it at a dedicated test database (e.g. restaurant_test), never your real one",
    );
  }
  await mongoose.connect(TEST_DB_URL);
  initSocket(new SocketServer());
};
export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
