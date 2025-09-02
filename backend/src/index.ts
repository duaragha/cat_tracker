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
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/profile', profileRouter);
app.use('/api/washroom', washroomRouter);
app.use('/api/food', foodRouter);
app.use('/api/sleep', sleepRouter);
app.use('/api/weight', weightRouter);
app.use('/api/photos', photosRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();