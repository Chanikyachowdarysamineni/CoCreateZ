import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const setRealtimeIO = (server: SocketIOServer) => {
  io = server;
};

export const getRealtimeIO = (): SocketIOServer | null => io;

export const emitProfileUpdate = (userId: string, payload: any) => {
  if (!io) return;
  try {
    // Prefer emitting to a user-specific room for privacy
    const room = `user:${userId}`;
    io.to(room).emit('profile:update', { userId, user: payload, timestamp: new Date() });
  } catch (err) {
    // fallback to broadcast if something goes wrong
    io.emit('profile:update', { userId, user: payload, timestamp: new Date() });
  }
};

export default {
  setRealtimeIO,
  getRealtimeIO,
  emitProfileUpdate
};
