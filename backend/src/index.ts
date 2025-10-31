import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool, initDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Files ---
app.use(express.static(path.join(__dirname, '../public')));
// Serve template files
app.use('/templates', express.static(path.join(__dirname, '../public/templates')));

// --- Routes ---
import templateRoutes from './routes/template';
import generateRoutes from './routes/generate';
import authRoutes from './routes/auth';
import verifyRoutes from './routes/verify';
import recipientRoutes from './routes/recipients';

app.use('/api/template', templateRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/allowed-recipients', recipientRoutes);

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error Handling Middleware ---
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// --- Initialize Database and Start Server ---
const startServer = async (): Promise<void> => {
  try {
    // ✅ Test DB connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // ✅ Initialize tables (if needed)
    await initDatabase();
    console.log('🗄️  Database initialized');

    // ✅ Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
