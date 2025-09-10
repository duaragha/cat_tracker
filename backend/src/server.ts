import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase, getQuery, allQuery, runQuery } from './db/database.js';
import paginatedRoutes from './routes/paginated.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for production
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests from Railway frontend or localhost for development
    const allowedOrigins = [
      'https://graceful-optimism-production.up.railway.app',
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked CORS request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Use paginated routes for v2 API
app.use(paginatedRoutes);

// Profile routes
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await getQuery('SELECT * FROM cat_profiles ORDER BY created_at DESC LIMIT 1');
    res.json(profile || null);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.delete('/api/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Delete all related data first
    await runQuery('DELETE FROM washroom_entries WHERE cat_id = ?', [id]);
    await runQuery('DELETE FROM food_entries WHERE cat_id = ?', [id]);
    await runQuery('DELETE FROM sleep_entries WHERE cat_id = ?', [id]);
    await runQuery('DELETE FROM weight_entries WHERE cat_id = ?', [id]);
    await runQuery('DELETE FROM photo_entries WHERE cat_id = ?', [id]);
    // Then delete the profile
    await runQuery('DELETE FROM cat_profiles WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const { name, breed, birth_date, gotcha_date, weight, photo_url } = req.body;
    
    // Check if a profile already exists
    const existingProfile = await getQuery('SELECT * FROM cat_profiles ORDER BY created_at DESC LIMIT 1');
    
    if (existingProfile) {
      // Update existing profile
      await runQuery(
        `UPDATE cat_profiles 
         SET name = ?, breed = ?, birth_date = ?, gotcha_date = ?, weight = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, breed, birth_date, gotcha_date, weight, photo_url, existingProfile.id]
      );
      const profile = await getQuery('SELECT * FROM cat_profiles WHERE id = ?', [existingProfile.id]);
      res.json(profile);
    } else {
      // Create new profile
      const id = uuidv4();
      await runQuery(
        `INSERT INTO cat_profiles (id, name, breed, birth_date, gotcha_date, weight, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, breed, birth_date, gotcha_date, weight, photo_url]
      );
      const profile = await getQuery('SELECT * FROM cat_profiles WHERE id = ?', [id]);
      res.json(profile);
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: 'Failed to create/update profile' });
  }
});

// Washroom routes
app.get('/api/washroom/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const entries = await allQuery(
      'SELECT * FROM washroom_entries WHERE cat_id = ? ORDER BY timestamp DESC',
      [catId]
    );
    res.json(entries.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [], has_blood: !!e.has_blood })));
  } catch (error) {
    console.error('Error fetching washroom entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/washroom', async (req, res) => {
  try {
    const { catId, timestamp, type, consistency, hasBlood, color, photos, notes } = req.body;
    const id = uuidv4();
    await runQuery(
      `INSERT INTO washroom_entries 
       (id, cat_id, timestamp, type, consistency, has_blood, color, photos, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, timestamp, type, consistency, hasBlood ? 1 : 0, color, JSON.stringify(photos || []), notes]
    );
    const entry = await getQuery('SELECT * FROM washroom_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [], has_blood: !!entry.has_blood });
  } catch (error) {
    console.error('Error creating washroom entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

app.put('/api/washroom/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, type, consistency, hasBlood, has_blood, color, photos, notes } = req.body;
    const blood = hasBlood !== undefined ? hasBlood : has_blood;
    
    // Build dynamic UPDATE query based on provided fields
    const updates = [];
    const values = [];
    
    if (timestamp !== undefined) { updates.push('timestamp = ?'); values.push(timestamp); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (consistency !== undefined) { updates.push('consistency = ?'); values.push(consistency); }
    if (blood !== undefined) { updates.push('has_blood = ?'); values.push(blood ? 1 : 0); }
    if (color !== undefined) { updates.push('color = ?'); values.push(color); }
    if (photos !== undefined) { updates.push('photos = ?'); values.push(JSON.stringify(photos || [])); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    if (updates.length > 0) {
      values.push(id);
      await runQuery(
        `UPDATE washroom_entries SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const entry = await getQuery('SELECT * FROM washroom_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [], has_blood: !!entry.has_blood });
  } catch (error) {
    console.error('Error updating washroom entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Food routes
app.get('/api/food/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const entries = await allQuery(
      'SELECT * FROM food_entries WHERE cat_id = ? ORDER BY timestamp DESC',
      [catId]
    );
    res.json(entries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/food', async (req, res) => {
  try {
    const { catId, timestamp, foodCategory, foodType, brand, amount, unit, portionToGrams, notes } = req.body;
    const id = uuidv4();
    await runQuery(
      `INSERT INTO food_entries 
       (id, cat_id, timestamp, food_category, food_type, brand, amount, unit, portion_to_grams, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, timestamp, foodCategory, foodType, brand, amount, unit, portionToGrams, notes]
    );
    const entry = await getQuery('SELECT * FROM food_entries WHERE id = ?', [id]);
    res.json(entry);
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

app.put('/api/food/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      timestamp, 
      foodCategory, food_category, 
      foodType, food_type, 
      brand, 
      amount, 
      unit, 
      portionToGrams, portion_to_grams, 
      notes
    } = req.body;
    
    // Handle both camelCase and snake_case
    const actualFoodCategory = foodCategory || food_category;
    const actualFoodType = foodType || food_type;
    const actualPortionToGrams = portionToGrams || portion_to_grams;
    
    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    
    if (timestamp !== undefined) { updates.push('timestamp = ?'); values.push(timestamp); }
    if (actualFoodCategory !== undefined) { updates.push('food_category = ?'); values.push(actualFoodCategory); }
    if (actualFoodType !== undefined) { updates.push('food_type = ?'); values.push(actualFoodType); }
    if (brand !== undefined) { updates.push('brand = ?'); values.push(brand); }
    if (amount !== undefined) { updates.push('amount = ?'); values.push(amount); }
    if (unit !== undefined) { updates.push('unit = ?'); values.push(unit); }
    if (actualPortionToGrams !== undefined) { updates.push('portion_to_grams = ?'); values.push(actualPortionToGrams); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    if (updates.length > 0) {
      values.push(id);
      await runQuery(
        `UPDATE food_entries SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const entry = await getQuery('SELECT * FROM food_entries WHERE id = ?', [id]);
    res.json(entry);
  } catch (error) {
    console.error('Error updating food entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Sleep routes
app.get('/api/sleep/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const entries = await allQuery(
      'SELECT * FROM sleep_entries WHERE cat_id = ? ORDER BY start_time DESC',
      [catId]
    );
    res.json(entries.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [] })));
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/sleep', async (req, res) => {
  try {
    const { catId, startTime, endTime, quality, location, customLocation, notes, photos } = req.body;
    const id = uuidv4();
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    await runQuery(
      `INSERT INTO sleep_entries 
       (id, cat_id, start_time, end_time, duration, quality, location, custom_location, notes, photos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, startTime, endTime, duration, quality, location, customLocation, notes, JSON.stringify(photos || [])]
    );
    const entry = await getQuery('SELECT * FROM sleep_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [] });
  } catch (error) {
    console.error('Error creating sleep entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

app.put('/api/sleep/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, start_time, endTime, end_time, quality, location, custom_location, customLocation, notes, photos } = req.body;
    
    // Handle both camelCase and snake_case
    const actualStartTime = startTime || start_time;
    const actualEndTime = endTime || end_time;
    const actualCustomLocation = customLocation || custom_location;
    
    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    
    if (actualStartTime && actualEndTime) {
      const start = new Date(actualStartTime);
      const end = new Date(actualEndTime);
      const duration = Math.floor((end.getTime() - start.getTime()) / 60000);
      updates.push('start_time = ?', 'end_time = ?', 'duration = ?');
      values.push(actualStartTime, actualEndTime, duration);
    }
    
    if (quality !== undefined) { updates.push('quality = ?'); values.push(quality); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (actualCustomLocation !== undefined) { updates.push('custom_location = ?'); values.push(actualCustomLocation); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    if (photos !== undefined) { updates.push('photos = ?'); values.push(JSON.stringify(photos || [])); }
    
    if (updates.length > 0) {
      values.push(id);
      await runQuery(
        `UPDATE sleep_entries SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const entry = await getQuery('SELECT * FROM sleep_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [] });
  } catch (error) {
    console.error('Error updating sleep entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Weight routes
app.get('/api/weight/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const entries = await allQuery(
      'SELECT * FROM weight_entries WHERE cat_id = ? ORDER BY measurement_date DESC',
      [catId]
    );
    res.json(entries.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [] })));
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/weight', async (req, res) => {
  try {
    const { catId, weight, measurement_date, photos, notes } = req.body;
    const id = uuidv4();
    await runQuery(
      `INSERT INTO weight_entries 
       (id, cat_id, weight, measurement_date, photos, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, catId, weight, measurement_date, JSON.stringify(photos || []), notes]
    );
    const entry = await getQuery('SELECT * FROM weight_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [] });
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

app.put('/api/weight/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, measurementDate, measurement_date, photos, notes } = req.body;
    
    // Handle both camelCase and snake_case
    const actualMeasurementDate = measurementDate || measurement_date;
    
    // Build dynamic UPDATE query
    const updates = [];
    const values = [];
    
    if (weight !== undefined) { updates.push('weight = ?'); values.push(weight); }
    if (actualMeasurementDate !== undefined) { updates.push('measurement_date = ?'); values.push(actualMeasurementDate); }
    if (photos !== undefined) { updates.push('photos = ?'); values.push(JSON.stringify(photos || [])); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    if (updates.length > 0) {
      values.push(id);
      await runQuery(
        `UPDATE weight_entries SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    const entry = await getQuery('SELECT * FROM weight_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [] });
  } catch (error) {
    console.error('Error updating weight entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Photos routes
app.get('/api/photos/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const entries = await allQuery(
      'SELECT * FROM photo_entries WHERE cat_id = ? ORDER BY upload_date DESC',
      [catId]
    );
    res.json(entries);
  } catch (error) {
    console.error('Error fetching photo entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/photos', async (req, res) => {
  try {
    const { catId, imageUrl, uploadDate, week, year, caption, notes } = req.body;
    const id = uuidv4();
    await runQuery(
      `INSERT INTO photo_entries 
       (id, cat_id, image_url, upload_date, week, year, caption, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, imageUrl, uploadDate, week, year, caption, notes]
    );
    const entry = await getQuery('SELECT * FROM photo_entries WHERE id = ?', [id]);
    res.json(entry);
  } catch (error) {
    console.error('Error creating photo entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Delete routes
app.delete('/api/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const tableMap: Record<string, string> = {
      washroom: 'washroom_entries',
      food: 'food_entries',
      sleep: 'sleep_entries',
      weight: 'weight_entries',
      photos: 'photo_entries'
    };
    
    if (tableMap[type]) {
      await runQuery(`DELETE FROM ${tableMap[type]} WHERE id = ?`, [id]);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid type' });
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Database fix endpoint (REMOVE THIS AFTER RUNNING ONCE)
app.get('/api/fix-database', async (req, res) => {
  try {
    console.log('Starting database fix...');
    
    // Only run if using PostgreSQL
    if (!process.env.DATABASE_URL) {
      return res.status(400).json({ error: 'This fix is only for PostgreSQL on Railway' });
    }
    
    // Import pool directly for raw queries
    const { pool } = await import('./db/pool.js');
    
    // Drop existing tables
    await pool.query('DROP TABLE IF EXISTS photo_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS weight_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS sleep_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS food_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS washroom_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS cat_profiles CASCADE');
    
    // Recreate with correct schema
    await pool.query(`
      CREATE TABLE cat_profiles (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        breed VARCHAR(255),
        birth_date DATE,
        gotcha_date DATE,
        weight DECIMAL(5,2),
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE washroom_entries (
        id TEXT PRIMARY KEY,
        cat_id TEXT REFERENCES cat_profiles(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        type VARCHAR(20) NOT NULL,
        consistency VARCHAR(50),
        has_blood BOOLEAN DEFAULT FALSE,
        color VARCHAR(50),
        photos TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE food_entries (
        id TEXT PRIMARY KEY,
        cat_id TEXT REFERENCES cat_profiles(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        food_category VARCHAR(20) NOT NULL,
        food_type VARCHAR(255) NOT NULL,
        brand VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        portion_to_grams DECIMAL(5,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE sleep_entries (
        id TEXT PRIMARY KEY,
        cat_id TEXT REFERENCES cat_profiles(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration INTEGER,
        quality VARCHAR(20),
        location VARCHAR(50) NOT NULL,
        custom_location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE weight_entries (
        id TEXT PRIMARY KEY,
        cat_id TEXT REFERENCES cat_profiles(id) ON DELETE CASCADE,
        weight DECIMAL(5,2) NOT NULL,
        measurement_date DATE NOT NULL,
        photos TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE photo_entries (
        id TEXT PRIMARY KEY,
        cat_id TEXT REFERENCES cat_profiles(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        upload_date DATE NOT NULL,
        week INTEGER NOT NULL,
        year INTEGER NOT NULL,
        caption VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    res.json({ 
      success: true, 
      message: 'Database tables recreated with correct schema! You can now use the app.' 
    });
  } catch (error) {
    console.error('Database fix failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Database: ${process.env.DATABASE_URL ? 'PostgreSQL (Railway)' : 'SQLite (Local)'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();