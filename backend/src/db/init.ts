import { pool } from './pool.js';

export async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cat_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cat_id UUID REFERENCES cat_profiles(id) ON DELETE CASCADE,
        timestamp TIMESTAMP NOT NULL,
        type VARCHAR(20) NOT NULL,
        consistency VARCHAR(50),
        has_blood BOOLEAN DEFAULT FALSE,
        color VARCHAR(50),
        photos TEXT[],
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS food_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cat_id UUID REFERENCES cat_profiles(id) ON DELETE CASCADE,
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cat_id UUID REFERENCES cat_profiles(id) ON DELETE CASCADE,
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
      CREATE TABLE IF NOT EXISTS weight_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cat_id UUID REFERENCES cat_profiles(id) ON DELETE CASCADE,
        weight DECIMAL(5,2) NOT NULL,
        measurement_date DATE NOT NULL,
        photos TEXT[],
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS photo_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cat_id UUID REFERENCES cat_profiles(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        upload_date DATE NOT NULL,
        week INTEGER NOT NULL,
        year INTEGER NOT NULL,
        caption VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}