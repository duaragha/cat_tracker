import { Router } from 'express';
import { pool } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

export const foodRouter = Router();

foodRouter.get('/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const result = await pool.query(
      'SELECT * FROM food_entries WHERE cat_id = $1 ORDER BY timestamp DESC',
      [catId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

foodRouter.post('/', async (req, res) => {
  try {
    const { catId, timestamp, foodCategory, foodType, brand, amount, unit, portionToGrams, notes } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO food_entries 
       (id, cat_id, timestamp, food_category, food_type, brand, amount, unit, portion_to_grams, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, catId, timestamp, foodCategory, foodType, brand, amount, unit, portionToGrams, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

foodRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM food_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});