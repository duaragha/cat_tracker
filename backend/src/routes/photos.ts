import { Router } from 'express';
import { pool } from '../db/pool.js';

export const photosRouter = Router();

photosRouter.get('/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const result = await pool.query(
      'SELECT * FROM photo_entries WHERE cat_id = $1 ORDER BY upload_date DESC',
      [catId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching photo entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

photosRouter.post('/', async (req, res) => {
  try {
    const { catId, imageUrl, uploadDate, week, year, caption, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO photo_entries 
       (cat_id, image_url, upload_date, week, year, caption, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [catId, imageUrl, uploadDate, week, year, caption, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating photo entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

photosRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM photo_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});