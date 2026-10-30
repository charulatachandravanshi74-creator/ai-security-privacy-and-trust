import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './server/config/db.ts';
import authRoutes from './server/routes/auth.ts';
import securityRoutes from './server/routes/security.ts';
import complianceRoutes from './server/routes/compliance.ts';
import statsRoutes from './server/routes/stats.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize Database connection / DDL schema
  await initDatabase();

  // Health and System Status Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: 'TrustShield AI Security Sentinel',
      version: '2.4.0',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/compliance', complianceRoutes);
  app.use('/api/dashboard', statsRoutes);
  app.use('/api/audits', statsRoutes);

  if (!isProduction) {
    // Development mode: Hook Vite middlewares into Express
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('⚡ Vite dev server middleware mounted');
  } else {
    // Production mode: Serve built static bundle from dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ TrustShield AI Enterprise Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting TrustShield AI server:', err);
  process.exit(1);
});
