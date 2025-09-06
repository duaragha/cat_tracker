import { pool } from './pool.js';
import { db, initSQLiteDB, runQuery as sqliteRun, getQuery as sqliteGet, allQuery as sqliteAll } from './sqlite.js';
import { initDB as initPostgresDB } from './init.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if we should use Postgres (Railway provides DATABASE_URL)
const USE_POSTGRES = !!process.env.DATABASE_URL;

console.log('Database mode:', USE_POSTGRES ? 'PostgreSQL' : 'SQLite');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

export async function initDatabase() {
  try {
    if (USE_POSTGRES) {
      console.log('Initializing PostgreSQL database...');
      // Uncomment the following lines ONLY for the first deployment to fix table schemas
      // After the first deployment, comment them out again
      /*
      try {
        await pool.query('DROP TABLE IF EXISTS photo_entries CASCADE');
        await pool.query('DROP TABLE IF EXISTS weight_entries CASCADE');
        await pool.query('DROP TABLE IF EXISTS sleep_entries CASCADE');
        await pool.query('DROP TABLE IF EXISTS food_entries CASCADE');
        await pool.query('DROP TABLE IF EXISTS washroom_entries CASCADE');
        await pool.query('DROP TABLE IF EXISTS cat_profiles CASCADE');
        console.log('Dropped existing tables');
      } catch (err) {
        console.log('No existing tables to drop or error dropping:', err);
      }
      */
      
      await initPostgresDB();
      console.log('PostgreSQL database initialized successfully');
    } else {
      console.log('Initializing SQLite database...');
      await initSQLiteDB();
      console.log('SQLite database initialized successfully');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
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
    
    // For UPDATE statements, add RETURNING * to get the updated row
    if (pgSql.trim().toUpperCase().startsWith('UPDATE')) {
      if (!pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING *';
      }
    }
    
    // For INSERT statements, add RETURNING * to get the inserted row
    if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
      if (!pgSql.toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING *';
      }
    }
    
    try {
      console.log('Executing PostgreSQL query:', pgSql.substring(0, 100) + '...');
      const result = await pool.query(pgSql, params);
      
      // For INSERT/UPDATE with RETURNING, return the row data
      if (pgSql.includes('RETURNING')) {
        const row = result.rows[0];
        if (row) {
          // Handle boolean conversion for has_blood field
          if ('has_blood' in row) {
            row.has_blood = row.has_blood ? 1 : 0;
          }
          // Keep photos as string (not array) for compatibility
          if (row.photos && row.photos !== null && row.photos !== '') {
            // Photos is already a string in our schema
          }
        }
        return { id: row?.id, row: row, changes: result.rowCount };
      }
      
      return { changes: result.rowCount };
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      console.error('Query:', pgSql);
      console.error('Params:', params);
      throw error;
    }
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
    
    try {
      console.log('Executing PostgreSQL get query:', pgSql.substring(0, 100) + '...');
      const result = await pool.query(pgSql, params);
      const row = result.rows[0];
      
      if (row) {
        // Convert boolean to integer for SQLite compatibility
        if ('has_blood' in row) {
          row.has_blood = row.has_blood ? 1 : 0;
        }
        // Photos should already be a string
      }
      
      return row;
    } catch (error) {
      console.error('PostgreSQL get query error:', error);
      console.error('Query:', pgSql);
      console.error('Params:', params);
      throw error;
    }
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
    
    try {
      console.log('Executing PostgreSQL all query:', pgSql.substring(0, 100) + '...');
      const result = await pool.query(pgSql, params);
      
      // Convert boolean to integer for SQLite compatibility
      return result.rows.map(row => {
        if ('has_blood' in row) {
          row.has_blood = row.has_blood ? 1 : 0;
        }
        // Photos should already be a string
        return row;
      });
    } catch (error) {
      console.error('PostgreSQL all query error:', error);
      console.error('Query:', pgSql);
      console.error('Params:', params);
      throw error;
    }
  } else {
    return sqliteAll(sql, params);
  }
}