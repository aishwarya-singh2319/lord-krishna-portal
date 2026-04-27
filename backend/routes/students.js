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
router.get('/', (req, res) => {
  const students = db.prepare(`
    SELECT s.*, f.total_fees, f.paid_amount,
           (f.total_fees - f.paid_amount) AS due_amount
    FROM students s
    LEFT JOIN fees f ON s.id = f.student_id
    ORDER BY s.created_at DESC
  `).all();
  res.json(students);
});

// POST add student
router.post('/', upload.single('photo'), (req, res) => {
  const { name, class: cls, roll_no, phone, email, address, admitted_on } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const result = db.prepare(`
      INSERT INTO students (name, class, roll_no, phone, email, address, photo_url, admitted_on)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, cls, roll_no, phone, email, address, photo_url, admitted_on);
    db.prepare('INSERT INTO fees (student_id) VALUES (?)').run(result.lastInsertRowid);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT update student
router.put('/:id', upload.single('photo'), (req, res) => {
  const { name, class: cls, roll_no, phone, email, address } = req.body;
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  if (photo_url) {
    db.prepare(`UPDATE students SET name=?, class=?, roll_no=?, phone=?, email=?, address=?, photo_url=? WHERE id=?`)
      .run(name, cls, roll_no, phone, email, address, photo_url, req.params.id);
  } else {
    db.prepare(`UPDATE students SET name=?, class=?, roll_no=?, phone=?, email=?, address=? WHERE id=?`)
      .run(name, cls, roll_no, phone, email, address, req.params.id);
  }
  res.json({ success: true });
});

// DELETE student
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
// One-time import route
router.post('/import-all', (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ error: 'No students data provided' });
  }
  
  const insertStudent = db.prepare(`
    INSERT OR IGNORE INTO students (name, class, roll_no, phone, email, address, admitted_on)
    VALUES (?, ?, ?, ?, ?, ?, date('now'))
  `);
  const insertFee = db.prepare(`
    INSERT OR IGNORE INTO fees (student_id, total_fees, paid_amount)
    VALUES (?, 0, 0)
  `);

  const importAll = db.transaction(() => {
    let count = 0;
    for (const s of students) {
      const result = insertStudent.run(
        s.name, s.class, s.roll_no,
        s.phone || '', s.email || '', s.address || ''
      );
      if (result.lastInsertRowid) {
        insertFee.run(result.lastInsertRowid);
        count++;
      }
    }
    return count;
  });

  const count = importAll();
  res.json({ success: true, imported: count });
});
module.exports = router;