import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDatabase } from './config/database';
import path from 'path'; // <-- 1. ADD THIS IMPORT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // <-- Make sure this is 5000

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// <-- 2. ADD THIS LINE to serve files from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Routes
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Initialize tables
    await initDatabase();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();