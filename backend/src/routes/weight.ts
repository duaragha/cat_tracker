import { Router } from 'express';
import { pool } from '../db/pool.js';

export const weightRouter = Router();

weightRouter.get('/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const result = await pool.query(
      'SELECT * FROM weight_entries WHERE cat_id = $1 ORDER BY measurement_date DESC',
      [catId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

weightRouter.post('/', async (req, res) => {
  try {
    const { catId, weight, measurementDate, photos, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO weight_entries 
       (cat_id, weight, measurement_date, photos, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [catId, weight, measurementDate, photos, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

weightRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM weight_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});