import app from './app';
import env from './config/env';

const PORT = env.port || 8080;

const server = app.listen(PORT, () => {
  console.log(`API running on port ${env.port}`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`${signal} received. Closing HTTP server.`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
