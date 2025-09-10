import { pool } from './pool.js';

export async function initDB() {
  try {
    // Drop existing tables to recreate with correct schema
    // Comment these out after first deployment
    /*
    await pool.query('DROP TABLE IF EXISTS photo_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS weight_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS sleep_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS food_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS washroom_entries CASCADE');
    await pool.query('DROP TABLE IF EXISTS cat_profiles CASCADE');
    */
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cat_profiles (
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
      CREATE TABLE IF NOT EXISTS washroom_entries (
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
      CREATE TABLE IF NOT EXISTS food_entries (
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
      CREATE TABLE IF NOT EXISTS sleep_entries (
        id TEXT PRIMARY KEY,
        cat_id TEXT REFERENCES cat_profiles(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration INTEGER,
        quality VARCHAR(20),
        location VARCHAR(50) NOT NULL,
        custom_location VARCHAR(255),
        notes TEXT,
        photos TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS weight_entries (
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
      CREATE TABLE IF NOT EXISTS photo_entries (
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

    // Add photos column to sleep_entries if it doesn't exist (for existing deployments)
    try {
      await pool.query(`
        ALTER TABLE sleep_entries 
        ADD COLUMN IF NOT EXISTS photos TEXT
      `);
      console.log('Ensured photos column exists in sleep_entries table');
    } catch (error) {
      // Column might already exist or table doesn't exist yet
      console.log('Photos column check completed');
    }

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}