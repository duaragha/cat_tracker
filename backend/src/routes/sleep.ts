import { Router } from 'express';
import { pool } from '../db/pool.js';

export const sleepRouter = Router();

sleepRouter.get('/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const result = await pool.query(
      'SELECT * FROM sleep_entries WHERE cat_id = $1 ORDER BY start_time DESC',
      [catId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

sleepRouter.post('/', async (req, res) => {
  try {
    const { catId, startTime, endTime, quality, location, customLocation, notes } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    const result = await pool.query(
      `INSERT INTO sleep_entries 
       (cat_id, start_time, end_time, duration, quality, location, custom_location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [catId, startTime, endTime, duration, quality, location, customLocation, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sleep entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

sleepRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sleep_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});