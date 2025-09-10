import { Router } from 'express';
import { pool } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

export const washroomRouter = Router();

washroomRouter.get('/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const result = await pool.query(
      'SELECT * FROM washroom_entries WHERE cat_id = $1 ORDER BY timestamp DESC',
      [catId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching washroom entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

washroomRouter.post('/', async (req, res) => {
  try {
    const { catId, timestamp, type, consistency, hasBlood, color, photos, notes } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO washroom_entries 
       (id, cat_id, timestamp, type, consistency, has_blood, color, photos, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, catId, timestamp, type, consistency, hasBlood, color, photos, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating washroom entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

washroomRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM washroom_entries WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting washroom entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});