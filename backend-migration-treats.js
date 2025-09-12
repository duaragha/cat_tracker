// Migration file for adding treats table
// Add this to your backend migrations folder

const createTreatsTable = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS treats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cat_id UUID NOT NULL REFERENCES cat_profiles(id) ON DELETE CASCADE,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      treat_type VARCHAR(255) NOT NULL,
      brand VARCHAR(255),
      quantity INTEGER NOT NULL DEFAULT 1,
      calories DECIMAL(5, 2),
      purpose VARCHAR(50) CHECK (purpose IN ('reward', 'training', 'medication', 'dental', 'just because')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  await db.query('CREATE INDEX IF NOT EXISTS idx_treats_cat_id ON treats(cat_id)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_treats_timestamp ON treats(timestamp DESC)');
  await db.query('CREATE INDEX IF NOT EXISTS idx_treats_purpose ON treats(purpose)');

  // Create update trigger
  await db.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql'
  `);

  await db.query(`
    CREATE TRIGGER update_treats_updated_at 
    BEFORE UPDATE ON treats
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column()
  `);
};

module.exports = { createTreatsTable };