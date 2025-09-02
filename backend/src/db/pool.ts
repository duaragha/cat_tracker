import pg from 'pg';
const { Pool } = pg;

// Debug: Log available environment variables
console.log('Database connection config:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGDATABASE: process.env.PGDATABASE,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD ? 'Set' : 'Not set',
  DB_HOST: process.env.DB_HOST,
  NODE_ENV: process.env.NODE_ENV
});

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
      database: process.env.DB_NAME || process.env.PGDATABASE || 'railway',
      user: process.env.DB_USER || process.env.PGUSER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };

console.log('Using connection config:', {
  ...connectionConfig,
  password: connectionConfig.password ? '***' : 'Not set',
  connectionString: connectionConfig.connectionString ? '***' : undefined
});

export const pool = new Pool(connectionConfig);