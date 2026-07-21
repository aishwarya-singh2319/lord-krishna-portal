const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT f.*, s.name, s.class, s.roll_no, s.phone, s.father_name
      FROM fees f JOIN students s ON f.student_id = s.id
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const students = await db.execute(`
      SELECT s.id AS student_id, s.name, s.class, s.roll_no, s.phone,
        COALESCE(SUM(CASE WHEN r.fee_type='Tuition Fee' THEN r.amount_paid ELSE 0 END),0) AS tuition_paid,
        COALESCE(SUM(CASE WHEN r.fee_type='Exam Fee' THEN r.amount_paid ELSE 0 END),0) AS exam_paid,
        COALESCE(SUM(CASE WHEN r.fee_type='Book Fee' THEN r.amount_paid ELSE 0 END),0) AS book_paid
      FROM students s
      LEFT JOIN fee_receipts r ON r.student_id = s.id
      GROUP BY s.id
    `);
    const classFees = await db.execute('SELECT * FROM class_fees');
    res.json({ students: students.rows, classFees: classFees.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

// POST collect payment — now supports payment_method, transaction_id, and a custom paid_on date (for backfilling historical payments)
router.post('/:studentId/pay', async (req, res) => {
  const { amount, months, fee_type, payment_method, transaction_id, paid_on } = req.body;
  try {
    const feeResult = await db.execute({
      sql: 'SELECT * FROM fees WHERE student_id=?',
      args: [req.params.studentId]
    });
    const fee = feeResult.rows[0];
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    const newPaid = Number(fee.paid_amount) + parseFloat(amount);
    const receiptNo = 'LKTS-' + Date.now().toString().slice(-6);
    const dateToUse = paid_on || new Date().toISOString().slice(0, 10);

    await db.execute({
      sql: 'UPDATE fees SET paid_amount=? WHERE student_id=?',
      args: [newPaid, req.params.studentId]
    });
    await db.execute({
      sql: `INSERT INTO fee_receipts (student_id, receipt_no, amount_paid, months, fee_type, payment_method, transaction_id, paid_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [req.params.studentId, receiptNo, amount, months || '', fee_type || 'Tuition Fee', payment_method || '', transaction_id || '', dateToUse]
    });

    res.json({ success: true, receipt_no: receiptNo, paid_amount: newPaid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET receipts for a single student
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

// GET all receipts across every student — powers the global Payment History view
router.get('/receipts/all', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT r.*, s.name, s.class, s.roll_no
      FROM fee_receipts r JOIN students s ON r.student_id = s.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;