import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cat_tracker',
  user: process.env.DB_USER || 'catuser',
  password: process.env.DB_PASSWORD || 'catpass123',
});