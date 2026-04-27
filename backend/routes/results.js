const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// Grade calculator
function getGrade(percentage) {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'F';
}

// GET all results
router.get('/', (req, res) => {
  const results = db.prepare(`
    SELECT r.*, s.name, s.class, s.roll_no
    FROM results r JOIN students s ON r.student_id = s.id
    ORDER BY r.percentage DESC
  `).all();
  res.json(results);
});

// GET results by class
router.get('/class/:className', (req, res) => {
  const results = db.prepare(`
    SELECT r.*, s.name, s.class, s.roll_no
    FROM results r JOIN students s ON r.student_id = s.id
    WHERE s.class = ?
    ORDER BY r.percentage DESC
  `).all(req.params.className);
  res.json(results);
});

// GET result for one student
router.get('/student/:studentId', (req, res) => {
  const result = db.prepare(`
    SELECT r.*, s.name, s.class, s.roll_no
    FROM results r JOIN students s ON r.student_id = s.id
    WHERE r.student_id = ?
  `).get(req.params.studentId);
  res.json(result || {});
});

// POST save result for one student
router.post('/', (req, res) => {
  const { student_id, hindi, english, maths, science, sst, exam_type, session } = req.body;
  
  const total = hindi + english + maths + science + sst;
  const percentage = (total / 500) * 100;
  const grade = getGrade(percentage);
  const status = percentage >= 33 ? 'Pass' : 'Fail';

  // Delete existing result for this student
  db.prepare('DELETE FROM results WHERE student_id = ?').run(student_id);
  
  // Insert new result
  db.prepare(`
    INSERT INTO results (student_id, exam_type, session, hindi, english, maths, science, sst, total, percentage, grade, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(student_id, exam_type || 'Annual', session || '2024-25', hindi, english, maths, science, sst, total, parseFloat(percentage.toFixed(2)), grade, status);

  // Recalculate ranks for the class
  const student = db.prepare('SELECT class FROM students WHERE id = ?').get(student_id);
  const classResults = db.prepare(`
    SELECT r.id FROM results r 
    JOIN students s ON r.student_id = s.id 
    WHERE s.class = ? 
    ORDER BY r.percentage DESC
  `).all(student.class);
  
  classResults.forEach((r, index) => {
    db.prepare('UPDATE results SET rank = ? WHERE id = ?').run(index + 1, r.id);
  });

  res.json({ success: true, percentage, grade, status });
});

// POST bulk import results from Excel data
router.post('/bulk', (req, res) => {
  const { results } = req.body;
  let imported = 0;

  const importTx = db.transaction(() => {
    for (const r of results) {
      const student = db.prepare(
        'SELECT id FROM students WHERE roll_no = ? OR name = ?'
      ).get(r.roll_no, r.name);
      
      if (!student) continue;

      const total = r.hindi + r.english + r.maths + r.science + r.sst;
      const percentage = (total / 500) * 100;
      const grade = getGrade(percentage);
      const status = percentage >= 33 ? 'Pass' : 'Fail';

      db.prepare('DELETE FROM results WHERE student_id = ?').run(student.id);
      db.prepare(`
        INSERT INTO results (student_id, exam_type, session, hindi, english, maths, science, sst, total, percentage, grade, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(student.id, r.exam_type || 'Annual', r.session || '2024-25', r.hindi, r.english, r.maths, r.science, r.sst, total, parseFloat(percentage.toFixed(2)), grade, status);
      imported++;
    }
  });
  importTx();

  // Recalculate all ranks by class
  const classes = db.prepare('SELECT DISTINCT class FROM students').all();
  classes.forEach(({ class: cls }) => {
    const classResults = db.prepare(`
      SELECT r.id FROM results r 
      JOIN students s ON r.student_id = s.id 
      WHERE s.class = ? 
      ORDER BY r.percentage DESC
    `).all(cls);
    classResults.forEach((r, index) => {
      db.prepare('UPDATE results SET rank = ? WHERE id = ?').run(index + 1, r.id);
    });
  });

  res.json({ success: true, imported });
});

module.exports = router;