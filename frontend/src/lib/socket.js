import { io } from "socket.io-client";

// Backend base URL (same origin as the REST API, minus the /api suffix).
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

// Strip a trailing "/api" so we connect to the socket.io server root.
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, "");

// Track active rooms so we can re-join after an unexpected disconnect.
const activeRooms = new Set();

// Single shared connection for the whole app.
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

// Re-join all active rooms whenever the connection is re-established
// (e.g. after the server restarts), so realtime updates keep flowing.
socket.on("connect", () => {
  activeRooms.forEach((room) => socket.emit("capacity:join", parseRoom(room)));
});

const parseRoom = (room) => {
  const [, doctorId, date] = room.split(":");
  return { doctorId, date };
};

/** Join the realtime room for a doctor+date capacity feed. */
export function joinCapacityRoom(doctorId, date) {
  const room = `capacity:${doctorId}:${date}`;
  activeRooms.add(room);
  socket.emit("capacity:join", { doctorId, date });
}

/** Leave the realtime room for a doctor+date capacity feed. */
export function leaveCapacityRoom(doctorId, date) {
  const room = `capacity:${doctorId}:${date}`;
  activeRooms.delete(room);
  socket.emit("capacity:leave", { doctorId, date });
}

export default socket;
