const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const db      = require('../db/database');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET all students
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT s.*, f.total_fees, f.paid_amount,
             (f.total_fees - f.paid_amount) AS due_amount
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add student
// POST add student
router.post('/', upload.single('photo'), async (req, res) => {
  const { name, class: cls, roll_no, phone, email, address, admitted_on } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    // Check if roll_no already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM students WHERE roll_no = ?',
      args: [roll_no]
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Roll number already exists!' });
    }

    const result = await db.execute({
      sql: `INSERT INTO students (name, class, roll_no, phone, email, address, photo_url, admitted_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [name, cls, roll_no, phone || '', email || '', address || '', photo_url, admitted_on]
    });
    await db.execute({
      sql: 'INSERT INTO fees (student_id) VALUES (?)',
      args: [result.lastInsertRowid]
    });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT update student
router.put('/:id', upload.single('photo'), async (req, res) => {
  const { name, class: cls, roll_no, phone, email, address } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    if (photo_url) {
      await db.execute({
        sql: `UPDATE students SET name=?, class=?, roll_no=?, phone=?, email=?, address=?, photo_url=? WHERE id=?`,
        args: [name, cls, roll_no, phone, email, address, photo_url, req.params.id]
      });
    } else {
      await db.execute({
        sql: `UPDATE students SET name=?, class=?, roll_no=?, phone=?, email=?, address=? WHERE id=?`,
        args: [name, cls, roll_no, phone, email, address, req.params.id]
      });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE student
// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await db.execute({ 
      sql: 'DELETE FROM students WHERE id = ?', 
      args: [parseInt(req.params.id)] 
    });
    await db.execute({
      sql: 'DELETE FROM fees WHERE student_id = ?',
      args: [parseInt(req.params.id)]
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST bulk import
router.post('/import-all', async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ error: 'No students data provided' });
  }
  let count = 0;
  for (const s of students) {
    try {
      const result = await db.execute({
        sql: `INSERT OR IGNORE INTO students (name, class, roll_no, phone, email, address, admitted_on)
              VALUES (?, ?, ?, ?, ?, ?, date('now'))`,
        args: [s.name, s.class, s.roll_no, s.phone || '', s.email || '', s.address || '']
      });
      if (result.rowsAffected > 0) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO fees (student_id, total_fees, paid_amount) VALUES (?, 0, 0)',
          args: [result.lastInsertRowid]
        });
        count++;
      }
    } catch (e) { continue; }
  }
  res.json({ success: true, imported: count });
});

module.exports = router;