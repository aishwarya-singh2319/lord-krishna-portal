const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET all fees
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT f.*, s.name, s.class, s.roll_no, s.phone
      FROM fees f JOIN students s ON f.student_id = s.id
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH set total fees
router.patch('/:studentId/total', async (req, res) => {
  const { total_fees } = req.body;
  try {
    await db.execute({
      sql: `UPDATE fees SET total_fees=?, updated_at=CURRENT_TIMESTAMP WHERE student_id=?`,
      args: [total_fees, req.params.studentId]
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST collect payment
router.post('/:studentId/pay', async (req, res) => {
  const { amount } = req.body;
  try {
    const feeResult = await db.execute({
      sql: 'SELECT * FROM fees WHERE student_id=?',
      args: [req.params.studentId]
    });
    const fee = feeResult.rows[0];
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    const newPaid = Math.min(fee.paid_amount + parseFloat(amount), fee.total_fees);
    const receiptNo = 'LKTS-' + Date.now().toString().slice(-6);

    await db.execute({
      sql: 'UPDATE fees SET paid_amount=? WHERE student_id=?',
      args: [newPaid, req.params.studentId]
    });
    await db.execute({
      sql: `INSERT INTO fee_receipts (student_id, receipt_no, amount_paid, paid_on) 
            VALUES (?, ?, ?, date('now'))`,
      args: [req.params.studentId, receiptNo, amount]
    });

    res.json({ success: true, receipt_no: receiptNo, paid_amount: newPaid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET receipts for a student
router.get('/:studentId/receipts', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM fee_receipts WHERE student_id=? ORDER BY created_at DESC`,
      args: [req.params.studentId]
    });
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;