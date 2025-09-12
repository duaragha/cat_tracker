-- SQL Schema for Treats Table
-- Compatible with PostgreSQL (Railway uses PostgreSQL)

-- Create treats table
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
);

-- Create index for faster queries
CREATE INDEX idx_treats_cat_id ON treats(cat_id);
CREATE INDEX idx_treats_timestamp ON treats(timestamp DESC);
CREATE INDEX idx_treats_purpose ON treats(purpose);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_treats_updated_at BEFORE UPDATE ON treats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample insert statement (for testing)
-- INSERT INTO treats (cat_id, timestamp, treat_type, brand, quantity, calories, purpose, notes)
-- VALUES ('your-cat-id', NOW(), 'Temptations', 'Temptations', 3, 2.5, 'reward', 'Good behavior reward');

-- To add this table to your existing Railway database:
-- 1. Go to your Railway dashboard
-- 2. Navigate to your database service
-- 3. Click on "Query" or connect to your database using the connection string
-- 4. Run this SQL script
-- 5. The table will be created and ready to use

-- Note: Make sure the cat_profiles table exists before running this script
-- as the cat_id column references it with a foreign key constraint