import app from './app';
import { config } from './config';

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(` Gateway is running on port ${PORT} in ${config.NODE_ENV} mode.`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
