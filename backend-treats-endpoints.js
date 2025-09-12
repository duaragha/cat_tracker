// Example backend endpoints for treats (Express.js/Node.js)

// GET all treats for a cat
app.get('/api/treats/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const result = await db.query(
      'SELECT * FROM treats WHERE cat_id = $1 ORDER BY timestamp DESC',
      [catId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching treats:', error);
    res.status(500).json({ error: 'Failed to fetch treats' });
  }
});

// POST new treat entry
app.post('/api/treats', async (req, res) => {
  try {
    const { catId, timestamp, treatType, brand, quantity, calories, purpose, notes } = req.body;
    
    const result = await db.query(
      `INSERT INTO treats (cat_id, timestamp, treat_type, brand, quantity, calories, purpose, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [catId, timestamp, treatType, brand, quantity, calories, purpose, notes]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating treat entry:', error);
    res.status(500).json({ error: 'Failed to create treat entry' });
  }
});

// PUT update treat entry
app.put('/api/treats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { timestamp, treatType, brand, quantity, calories, purpose, notes } = req.body;
    
    const result = await db.query(
      `UPDATE treats 
       SET timestamp = $2, treat_type = $3, brand = $4, quantity = $5, 
           calories = $6, purpose = $7, notes = $8, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, timestamp, treatType, brand, quantity, calories, purpose, notes]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating treat entry:', error);
    res.status(500).json({ error: 'Failed to update treat entry' });
  }
});

// DELETE treat entry
app.delete('/api/treats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM treats WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting treat entry:', error);
    res.status(500).json({ error: 'Failed to delete treat entry' });
  }
});