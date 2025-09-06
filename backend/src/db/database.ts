import { pool } from './pool.js';
import { db, initSQLiteDB, runQuery as sqliteRun, getQuery as sqliteGet, allQuery as sqliteAll } from './sqlite.js';
import { initDB as initPostgresDB } from './init.js';

// Check if we should use Postgres (Railway provides DATABASE_URL)
const USE_POSTGRES = !!process.env.DATABASE_URL || process.env.NODE_ENV === 'production';

console.log('Database mode:', USE_POSTGRES ? 'PostgreSQL' : 'SQLite');

export async function initDatabase() {
  if (USE_POSTGRES) {
    await initPostgresDB();
  } else {
    await initSQLiteDB();
  }
}

export async function runQuery(sql: string, params: any[] = []): Promise<any> {
  if (USE_POSTGRES) {
    // Convert SQLite style placeholders (?) to PostgreSQL style ($1, $2, etc.)
    let pgSql = sql;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    const result = await pool.query(pgSql, params);
    return { id: result.rows[0]?.id, changes: result.rowCount };
  } else {
    return sqliteRun(sql, params);
  }
}

export async function getQuery(sql: string, params: any[] = []): Promise<any> {
  if (USE_POSTGRES) {
    // Convert SQLite style placeholders
    let pgSql = sql;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    // Handle column name differences
    pgSql = pgSql
      .replace(/\bcat_id\b/g, 'cat_id')
      .replace(/\bphotos\b/g, 'photos')
      .replace(/\bhas_blood\b/g, 'has_blood')
      .replace(/\bportion_to_grams\b/g, 'portion_to_grams')
      .replace(/\bcustom_location\b/g, 'custom_location')
      .replace(/\bmeasurement_date\b/g, 'measurement_date')
      .replace(/\bupload_date\b/g, 'upload_date');
    
    const result = await pool.query(pgSql, params);
    const row = result.rows[0];
    
    // Convert PostgreSQL arrays back to JSON strings for compatibility
    if (row) {
      if (row.photos && Array.isArray(row.photos)) {
        row.photos = JSON.stringify(row.photos);
      }
      // Convert boolean to integer for SQLite compatibility
      if (typeof row.has_blood === 'boolean') {
        row.has_blood = row.has_blood ? 1 : 0;
      }
    }
    
    return row;
  } else {
    return sqliteGet(sql, params);
  }
}

export async function allQuery(sql: string, params: any[] = []): Promise<any[]> {
  if (USE_POSTGRES) {
    // Convert SQLite style placeholders
    let pgSql = sql;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex}`);
      paramIndex++;
    }
    
    const result = await pool.query(pgSql, params);
    
    // Convert PostgreSQL arrays back to JSON strings for compatibility
    return result.rows.map(row => {
      if (row.photos && Array.isArray(row.photos)) {
        row.photos = JSON.stringify(row.photos);
      }
      // Convert boolean to integer for SQLite compatibility
      if (typeof row.has_blood === 'boolean') {
        row.has_blood = row.has_blood ? 1 : 0;
      }
      return row;
    });
  } else {
    return sqliteAll(sql, params);
  }
}

// Helper function to generate IDs (UUID for Postgres, UUID for SQLite too for consistency)
export function generateId(): string {
  // Use UUID v4 for both databases for consistency
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}