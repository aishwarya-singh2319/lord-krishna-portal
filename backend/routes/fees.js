const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// GET all fees
router.get('/', (req, res) => {
  const fees = db.prepare(`
    SELECT f.*, s.name, s.class, s.roll_no, s.phone
    FROM fees f JOIN students s ON f.student_id = s.id
  `).all();
  res.json(fees);
});

// PATCH set total fees
router.patch('/:studentId/total', (req, res) => {
  const { total_fees } = req.body;
  db.prepare(`
    UPDATE fees SET total_fees=?, updated_at=CURRENT_TIMESTAMP 
    WHERE student_id=?
  `).run(total_fees, req.params.studentId);
  res.json({ success: true });
});

// POST collect payment
router.post('/:studentId/pay', (req, res) => {
  const { amount } = req.body;
  const fee = db.prepare('SELECT * FROM fees WHERE student_id=?').get(req.params.studentId);
  if (!fee) return res.status(404).json({ error: 'Fee record not found' });

  const newPaid = Math.min(fee.paid_amount + parseFloat(amount), fee.total_fees);
  const receiptNo = 'LKTS-' + Date.now().toString().slice(-6);

  const payTx = db.transaction(() => {
    db.prepare(`UPDATE fees SET paid_amount=? WHERE student_id=?`)
      .run(newPaid, req.params.studentId);
    db.prepare(`
      INSERT INTO fee_receipts (student_id, receipt_no, amount_paid, paid_on) 
      VALUES (?, ?, ?, date('now'))
    `).run(req.params.studentId, receiptNo, amount);
  });
  payTx();

  res.json({ success: true, receipt_no: receiptNo, paid_amount: newPaid });
});

// GET receipts for a student
router.get('/:studentId/receipts', (req, res) => {
  const receipts = db.prepare(`
    SELECT * FROM fee_receipts 
    WHERE student_id=? 
    ORDER BY created_at DESC
  `).all(req.params.studentId);
  res.json(receipts);
});

module.exports = router;