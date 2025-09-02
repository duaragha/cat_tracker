import pg from 'pg';
const { Pool } = pg;

// Railway provides DATABASE_URL, use it if available
// Otherwise fall back to individual environment variables
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
      port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
      database: process.env.DB_NAME || process.env.PGDATABASE || 'cat_tracker',
      user: process.env.DB_USER || process.env.PGUSER || 'catuser',
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'catpass123',
    };

export const pool = new Pool(connectionConfig);