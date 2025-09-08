#!/usr/bin/env node
import { pool } from './pool.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addPhotosColumn() {
  console.log('Adding photos column to sleep_entries table...');
  
  try {
    // Add photos column to sleep_entries table
    await pool.query(`
      ALTER TABLE sleep_entries 
      ADD COLUMN IF NOT EXISTS photos TEXT
    `);
    console.log('Successfully added photos column to sleep_entries table');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addPhotosColumn();