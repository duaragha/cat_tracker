import { Router } from 'express';
import { pool } from '../db/pool.js';

export const profileRouter = Router();

profileRouter.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cat_profiles ORDER BY created_at DESC LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

profileRouter.post('/', async (req, res) => {
  try {
    const { name, breed, birthDate, gotchaDate, weight, photoUrl } = req.body;
    const result = await pool.query(
      `INSERT INTO cat_profiles (name, breed, birth_date, gotcha_date, weight, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, breed, birthDate, gotchaDate, weight, photoUrl]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

profileRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, breed, birthDate, gotchaDate, weight, photoUrl } = req.body;
    const result = await pool.query(
      `UPDATE cat_profiles 
       SET name = $1, breed = $2, birth_date = $3, gotcha_date = $4, 
           weight = $5, photo_url = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, breed, birthDate, gotchaDate, weight, photoUrl, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});