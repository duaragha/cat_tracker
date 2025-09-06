import express from 'express';
import { pool } from './db/pool.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.get('/fix', async (req, res) => {
  try {
    console.log('Starting database fix...');
    
    // Drop existing tables
    await pool.query('DROP TABLE IF EXISTS photo_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS weight_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS sleep_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS food_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS washroom_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS cat_profiles CASCADE');
    
    // Create tables with correct schema
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
      message: 'Database tables recreated successfully with correct schema!' 
    });
  } catch (error) {
    console.error('Fix failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Fix server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/fix to run the database fix`);
});