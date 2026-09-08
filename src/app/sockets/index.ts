import { Server } from "socket.io";
let io: Server | null = null;
export const initSocket = (server: Server): void => {
  io = server;
  io.on("connection", (socket) => {
    // Each client tells us which role room to join (e.g. "kitchen", "counter")
    // so we can later emit events to just that role instead of broadcasting to everyone.
    socket.on("join-room", (room: string) => {
      socket.join(room);
    });
  });
};
export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
