import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../cat_tracker.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

export function initSQLiteDB() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS cat_profiles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          breed TEXT,
          birth_date DATE,
          gotcha_date DATE,
          weight REAL,
          photo_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS washroom_entries (
          id TEXT PRIMARY KEY,
          cat_id TEXT,
          timestamp DATETIME NOT NULL,
          type TEXT NOT NULL,
          consistency TEXT,
          has_blood INTEGER DEFAULT 0,
          color TEXT,
          photos TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cat_id) REFERENCES cat_profiles(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS food_entries (
          id TEXT PRIMARY KEY,
          cat_id TEXT,
          timestamp DATETIME NOT NULL,
          food_category TEXT NOT NULL,
          food_type TEXT NOT NULL,
          brand TEXT,
          amount REAL NOT NULL,
          unit TEXT NOT NULL,
          portion_to_grams REAL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cat_id) REFERENCES cat_profiles(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS sleep_entries (
          id TEXT PRIMARY KEY,
          cat_id TEXT,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          duration INTEGER,
          quality TEXT,
          location TEXT NOT NULL,
          custom_location TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cat_id) REFERENCES cat_profiles(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS weight_entries (
          id TEXT PRIMARY KEY,
          cat_id TEXT,
          weight REAL NOT NULL,
          measurement_date DATE NOT NULL,
          photos TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cat_id) REFERENCES cat_profiles(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS photo_entries (
          id TEXT PRIMARY KEY,
          cat_id TEXT,
          image_url TEXT NOT NULL,
          upload_date DATE NOT NULL,
          week INTEGER NOT NULL,
          year INTEGER NOT NULL,
          caption TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cat_id) REFERENCES cat_profiles(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database tables initialized');
          resolve();
        }
      });
    });
  });
}

export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}