const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET all class fee settings
router.get('/', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM class_fees');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST/PATCH set fee for a class + fee type (upsert)
router.post('/', async (req, res) => {
  const { class: cls, fee_type, amount } = req.body;
  if (!cls || !fee_type) return res.status(400).json({ error: 'class and fee_type required' });
  try {
    await db.execute({
      sql: `INSERT INTO class_fees (class, fee_type, amount, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(class, fee_type) DO UPDATE SET amount=excluded.amount, updated_at=CURRENT_TIMESTAMP`,
      args: [cls, fee_type, amount]
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;