import { io } from 'socket.io-client';

// Singleton Socket.IO client for the entire app
// Ensures a single connection and shared room/event handling
const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: true,
  withCredentials: true,
});

export default socket;
