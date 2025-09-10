import express from 'express';
import { allQuery } from '../db/database.js';

const router = express.Router();

// Paginated endpoints for better performance
router.get('/api/v2/washroom/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM washroom_entries WHERE cat_id = ?';
    const params: any[] = [catId];
    
    if (startDate && endDate) {
      query += ' AND timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const entries = await allQuery(query, params);
    
    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM washroom_entries WHERE cat_id = ?';
    const countResult = await allQuery(countQuery, [catId]);
    const total = countResult[0]?.total || 0;
    
    res.json({
      data: entries.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [], has_blood: !!e.has_blood })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching paginated washroom entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.get('/api/v2/food/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM food_entries WHERE cat_id = ?';
    const params: any[] = [catId];
    
    if (startDate && endDate) {
      query += ' AND timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const entries = await allQuery(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM food_entries WHERE cat_id = ?';
    const countResult = await allQuery(countQuery, [catId]);
    const total = countResult[0]?.total || 0;
    
    res.json({
      data: entries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching paginated food entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.get('/api/v2/sleep/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM sleep_entries WHERE cat_id = ?';
    const params: any[] = [catId];
    
    if (startDate && endDate) {
      query += ' AND start_time BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY start_time DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const entries = await allQuery(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM sleep_entries WHERE cat_id = ?';
    const countResult = await allQuery(countQuery, [catId]);
    const total = countResult[0]?.total || 0;
    
    res.json({
      data: entries.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [] })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching paginated sleep entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.get('/api/v2/weight/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM weight_entries WHERE cat_id = ?';
    const params: any[] = [catId];
    
    if (startDate && endDate) {
      query += ' AND measurement_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY measurement_date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    const entries = await allQuery(query, params);
    
    const countQuery = 'SELECT COUNT(*) as total FROM weight_entries WHERE cat_id = ?';
    const countResult = await allQuery(countQuery, [catId]);
    const total = countResult[0]?.total || 0;
    
    res.json({
      data: entries.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [] })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching paginated weight entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Batch endpoint for fetching all data with limits
router.get('/api/v2/batch/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const limit = 50; // Fetch only recent 50 of each type
    
    const [washroom, food, sleep, weight, photos] = await Promise.all([
      allQuery(
        'SELECT * FROM washroom_entries WHERE cat_id = ? ORDER BY timestamp DESC LIMIT ?',
        [catId, limit]
      ),
      allQuery(
        'SELECT * FROM food_entries WHERE cat_id = ? ORDER BY timestamp DESC LIMIT ?',
        [catId, limit]
      ),
      allQuery(
        'SELECT * FROM sleep_entries WHERE cat_id = ? ORDER BY start_time DESC LIMIT ?',
        [catId, limit]
      ),
      allQuery(
        'SELECT * FROM weight_entries WHERE cat_id = ? ORDER BY measurement_date DESC LIMIT ?',
        [catId, limit]
      ),
      allQuery(
        'SELECT * FROM photo_entries WHERE cat_id = ? ORDER BY upload_date DESC LIMIT ?',
        [catId, limit]
      )
    ]);
    
    res.json({
      washroom: washroom.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [], has_blood: !!e.has_blood })),
      food,
      sleep: sleep.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [] })),
      weight: weight.map(e => ({ ...e, photos: e.photos ? JSON.parse(e.photos) : [] })),
      photos
    });
  } catch (error) {
    console.error('Error fetching batch data:', error);
    res.status(500).json({ error: 'Failed to fetch batch data' });
  }
});

export default router;