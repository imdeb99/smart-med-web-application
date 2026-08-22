const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const { initSocket } = require('./config/socket');

const server = app.listen(env.port, () => {
  console.log(`SMART-MED API listening on http://localhost:${env.port}`);
});

initSocket(server);

// Graceful shutdown: close the HTTP server, then disconnect Prisma.
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
