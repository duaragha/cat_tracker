import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { profileRouter } from './routes/profile.js';
import { washroomRouter } from './routes/washroom.js';
import { foodRouter } from './routes/food.js';
import { sleepRouter } from './routes/sleep.js';
import { weightRouter } from './routes/weight.js';
import { photosRouter } from './routes/photos.js';
import { initDB } from './db/init.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Configure CORS properly for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cat Tracker Backend API',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      apiHealth: '/api/health'
    }
  });
});

// Health check routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', port: PORT, env: process.env.NODE_ENV });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Cat Tracker API v1.0',
    endpoints: [
      '/api/health',
      '/api/profile',
      '/api/washroom',
      '/api/food',
      '/api/sleep',
      '/api/weight',
      '/api/photos'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/profile', profileRouter);
app.use('/api/washroom', washroomRouter);
app.use('/api/food', foodRouter);
app.use('/api/sleep', sleepRouter);
app.use('/api/weight', weightRouter);
app.use('/api/photos', photosRouter);

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

async function start() {
  try {
    console.log('Starting server...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    
    await initDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ API endpoints: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();