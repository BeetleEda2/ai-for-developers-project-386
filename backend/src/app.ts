import express from 'express';
import cors from 'cors';
import routes from './routes.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json());
  app.use('/', routes);
  return app;
}
