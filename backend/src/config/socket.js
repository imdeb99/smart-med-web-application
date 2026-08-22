const { Server } = require('socket.io');
const env = require('./env');

let io = null;

/**
 * Attach Socket.io to the HTTP server. Kept separate from the REST app so
 * the Express routes are completely unaffected. CORS mirrors the REST setup.
 */
const initSocket = (server) => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Clients join rooms of the form `capacity:<doctorId>:<date>` to receive
    // live booked/available updates for that day.
    socket.on('capacity:join', ({ doctorId, date }) => {
      if (!doctorId || !date) return;
      socket.join(`capacity:${doctorId}:${date}`);
    });

    socket.on('capacity:leave', ({ doctorId, date }) => {
      if (!doctorId || !date) return;
      socket.leave(`capacity:${doctorId}:${date}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIo = () => io;

/** Emit a live capacity update to everyone watching that doctor+date room. */
const emitCapacityUpdate = ({ doctorId, date, capacity }) => {
  if (!io) return;
  io.to(`capacity:${doctorId}:${date}`).emit('capacity-update', { doctorId, date, capacity });
};

module.exports = { initSocket, getIo, emitCapacityUpdate };
