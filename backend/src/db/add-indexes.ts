import { pool } from './pool.js';
import { db } from './sqlite.js';
import dotenv from 'dotenv';

dotenv.config();

const USE_POSTGRES = !!process.env.DATABASE_URL;

export async function addIndexes() {
  console.log('Adding database indexes for performance optimization...');
  
  if (USE_POSTGRES) {
    try {
      // PostgreSQL indexes
      const indexes = [
        // Core indexes for foreign keys and timestamps
        'CREATE INDEX IF NOT EXISTS idx_washroom_cat_id ON washroom_entries(cat_id)',
        'CREATE INDEX IF NOT EXISTS idx_washroom_timestamp ON washroom_entries(timestamp DESC)',
        'CREATE INDEX IF NOT EXISTS idx_washroom_cat_timestamp ON washroom_entries(cat_id, timestamp DESC)',
        
        'CREATE INDEX IF NOT EXISTS idx_food_cat_id ON food_entries(cat_id)',
        'CREATE INDEX IF NOT EXISTS idx_food_timestamp ON food_entries(timestamp DESC)',
        'CREATE INDEX IF NOT EXISTS idx_food_cat_timestamp ON food_entries(cat_id, timestamp DESC)',
        
        'CREATE INDEX IF NOT EXISTS idx_sleep_cat_id ON sleep_entries(cat_id)',
        'CREATE INDEX IF NOT EXISTS idx_sleep_start_time ON sleep_entries(start_time DESC)',
        'CREATE INDEX IF NOT EXISTS idx_sleep_cat_start ON sleep_entries(cat_id, start_time DESC)',
        
        'CREATE INDEX IF NOT EXISTS idx_weight_cat_id ON weight_entries(cat_id)',
        'CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_entries(measurement_date DESC)',
        'CREATE INDEX IF NOT EXISTS idx_weight_cat_date ON weight_entries(cat_id, measurement_date DESC)',
        
        'CREATE INDEX IF NOT EXISTS idx_photo_cat_id ON photo_entries(cat_id)',
        'CREATE INDEX IF NOT EXISTS idx_photo_upload_date ON photo_entries(upload_date DESC)',
        'CREATE INDEX IF NOT EXISTS idx_photo_cat_date ON photo_entries(cat_id, upload_date DESC)',
        
        // Profile index for quick lookups
        'CREATE INDEX IF NOT EXISTS idx_profile_created ON cat_profiles(created_at DESC)',
      ];
      
      for (const index of indexes) {
        try {
          await pool.query(index);
          console.log(`✓ Created index: ${index.match(/idx_\w+/)?.[0]}`);
        } catch (err) {
          console.error(`Failed to create index: ${index.match(/idx_\w+/)?.[0]}`, err);
        }
      }
      
      // Analyze tables for query optimization
      const tables = ['cat_profiles', 'washroom_entries', 'food_entries', 'sleep_entries', 'weight_entries', 'photo_entries'];
      for (const table of tables) {
        await pool.query(`ANALYZE ${table}`);
        console.log(`✓ Analyzed table: ${table}`);
      }
      
      console.log('PostgreSQL indexes created successfully!');
    } catch (error) {
      console.error('Error creating PostgreSQL indexes:', error);
      throw error;
    }
  } else {
    // SQLite indexes
    return new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        const indexes = [
          'CREATE INDEX IF NOT EXISTS idx_washroom_cat_id ON washroom_entries(cat_id)',
          'CREATE INDEX IF NOT EXISTS idx_washroom_timestamp ON washroom_entries(timestamp DESC)',
          'CREATE INDEX IF NOT EXISTS idx_washroom_cat_timestamp ON washroom_entries(cat_id, timestamp DESC)',
          
          'CREATE INDEX IF NOT EXISTS idx_food_cat_id ON food_entries(cat_id)',
          'CREATE INDEX IF NOT EXISTS idx_food_timestamp ON food_entries(timestamp DESC)',
          'CREATE INDEX IF NOT EXISTS idx_food_cat_timestamp ON food_entries(cat_id, timestamp DESC)',
          
          'CREATE INDEX IF NOT EXISTS idx_sleep_cat_id ON sleep_entries(cat_id)',
          'CREATE INDEX IF NOT EXISTS idx_sleep_start_time ON sleep_entries(start_time DESC)',
          'CREATE INDEX IF NOT EXISTS idx_sleep_cat_start ON sleep_entries(cat_id, start_time DESC)',
          
          'CREATE INDEX IF NOT EXISTS idx_weight_cat_id ON weight_entries(cat_id)',
          'CREATE INDEX IF NOT EXISTS idx_weight_date ON weight_entries(measurement_date DESC)',
          'CREATE INDEX IF NOT EXISTS idx_weight_cat_date ON weight_entries(cat_id, measurement_date DESC)',
          
          'CREATE INDEX IF NOT EXISTS idx_photo_cat_id ON photo_entries(cat_id)',
          'CREATE INDEX IF NOT EXISTS idx_photo_upload_date ON photo_entries(upload_date DESC)',
          'CREATE INDEX IF NOT EXISTS idx_photo_cat_date ON photo_entries(cat_id, upload_date DESC)',
          
          'CREATE INDEX IF NOT EXISTS idx_profile_created ON cat_profiles(created_at DESC)',
        ];
        
        let completed = 0;
        indexes.forEach(index => {
          db.run(index, (err) => {
            if (err) {
              console.error(`Failed to create index: ${index.match(/idx_\w+/)?.[0]}`, err);
            } else {
              console.log(`✓ Created index: ${index.match(/idx_\w+/)?.[0]}`);
            }
            completed++;
            if (completed === indexes.length) {
              // Run ANALYZE to update SQLite's query planner statistics
              db.run('ANALYZE', (err) => {
                if (err) {
                  console.error('Failed to analyze database:', err);
                  reject(err);
                } else {
                  console.log('✓ SQLite database analyzed');
                  console.log('SQLite indexes created successfully!');
                  resolve();
                }
              });
            }
          });
        });
      });
    });
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addIndexes()
    .then(() => {
      console.log('Index creation completed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Index creation failed:', err);
      process.exit(1);
    });
}