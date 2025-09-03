import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initSQLiteDB, getQuery, allQuery, runQuery } from './db/sqlite.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
    const { name, breed, birthDate, gotchaDate, weight, photoUrl } = req.body;
    
    // Check if a profile already exists
    const existingProfile = await getQuery('SELECT * FROM cat_profiles ORDER BY created_at DESC LIMIT 1');
    
    if (existingProfile) {
      // Update existing profile
      await runQuery(
        `UPDATE cat_profiles 
         SET name = ?, breed = ?, birth_date = ?, gotcha_date = ?, weight = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, breed, birthDate, gotchaDate, weight, photoUrl, existingProfile.id]
      );
      const profile = await getQuery('SELECT * FROM cat_profiles WHERE id = ?', [existingProfile.id]);
      res.json(profile);
    } else {
      // Create new profile
      const id = uuidv4();
      await runQuery(
        `INSERT INTO cat_profiles (id, name, breed, birth_date, gotcha_date, weight, photo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, breed, birthDate, gotchaDate, weight, photoUrl]
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

// Sleep routes
app.get('/api/sleep/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const entries = await allQuery(
      'SELECT * FROM sleep_entries WHERE cat_id = ? ORDER BY start_time DESC',
      [catId]
    );
    res.json(entries);
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

app.post('/api/sleep', async (req, res) => {
  try {
    const { catId, startTime, endTime, quality, location, customLocation, notes } = req.body;
    const id = uuidv4();
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    await runQuery(
      `INSERT INTO sleep_entries 
       (id, cat_id, start_time, end_time, duration, quality, location, custom_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, catId, startTime, endTime, duration, quality, location, customLocation, notes]
    );
    const entry = await getQuery('SELECT * FROM sleep_entries WHERE id = ?', [id]);
    res.json(entry);
  } catch (error) {
    console.error('Error creating sleep entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
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
    const { catId, weight, measurementDate, photos, notes } = req.body;
    const id = uuidv4();
    await runQuery(
      `INSERT INTO weight_entries 
       (id, cat_id, weight, measurement_date, photos, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, catId, weight, measurementDate, JSON.stringify(photos || []), notes]
    );
    const entry = await getQuery('SELECT * FROM weight_entries WHERE id = ?', [id]);
    res.json({ ...entry, photos: entry.photos ? JSON.parse(entry.photos) : [] });
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
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

async function start() {
  try {
    await initSQLiteDB();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();