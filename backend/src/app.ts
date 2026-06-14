import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import routes from './routes.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json());

  // API routes
  app.use('/', routes);

  // Serve frontend static files
  const frontendDist = process.env.FRONTEND_DIST_PATH || path.resolve(process.cwd(), '../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // SPA fallback: browser navigation → index.html; API calls without route → 404 JSON
    app.use((req, res) => {
      if (req.method === 'GET' && req.accepts('html')) {
        res.sendFile(path.join(frontendDist, 'index.html'));
      } else {
        res.status(404).json({ code: 'NOT_FOUND', message: 'Not found' });
      }
    });
  }

  return app;
}
