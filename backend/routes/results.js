const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

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
router.get('/', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT r.*, s.name, s.class, s.roll_no
      FROM results r JOIN students s ON r.student_id = s.id
      ORDER BY r.percentage DESC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET result for one student
router.get('/student/:studentId', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT r.*, s.name, s.class, s.roll_no
            FROM results r JOIN students s ON r.student_id = s.id
            WHERE r.student_id = ?`,
      args: [req.params.studentId]
    });
    res.json(result.rows[0] || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST save result for one student
router.post('/', async (req, res) => {
  const { student_id, hindi, english, maths, science, sst, exam_type, session } = req.body;
  const total = hindi + english + maths + science + sst;
  const percentage = parseFloat((total / 500 * 100).toFixed(2));
  const grade = getGrade(percentage);
  const status = percentage >= 33 ? 'Pass' : 'Fail';

  try {
    await db.execute({
      sql: 'DELETE FROM results WHERE student_id = ?',
      args: [student_id]
    });
    await db.execute({
      sql: `INSERT INTO results (student_id, exam_type, session, hindi, english, maths, science, sst, total, percentage, grade, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [student_id, exam_type || 'Annual', session || '2024-25', hindi, english, maths, science, sst, total, percentage, grade, status]
    });

    // Recalculate ranks
    const studentRes = await db.execute({
      sql: 'SELECT class FROM students WHERE id = ?',
      args: [student_id]
    });
    const cls = studentRes.rows[0].class;
    const classResults = await db.execute({
      sql: `SELECT r.id FROM results r 
            JOIN students s ON r.student_id = s.id 
            WHERE s.class = ? ORDER BY r.percentage DESC`,
      args: [cls]
    });
    for (let i = 0; i < classResults.rows.length; i++) {
      await db.execute({
        sql: 'UPDATE results SET rank = ? WHERE id = ?',
        args: [i + 1, classResults.rows[i].id]
      });
    }

    res.json({ success: true, percentage, grade, status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST bulk import results
router.post('/bulk', async (req, res) => {
  const { results } = req.body;
  let imported = 0;

  for (const r of results) {
    try {
      const studentRes = await db.execute({
        sql: 'SELECT id FROM students WHERE roll_no = ? OR name = ?',
        args: [r.roll_no, r.name]
      });
      if (!studentRes.rows[0]) continue;

      const student_id = studentRes.rows[0].id;
      const total = r.hindi + r.english + r.maths + r.science + r.sst;
      const percentage = parseFloat((total / 500 * 100).toFixed(2));
      const grade = getGrade(percentage);
      const status = percentage >= 33 ? 'Pass' : 'Fail';

      await db.execute({
        sql: 'DELETE FROM results WHERE student_id = ?',
        args: [student_id]
      });
      await db.execute({
        sql: `INSERT INTO results (student_id, exam_type, session, hindi, english, maths, science, sst, total, percentage, grade, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [student_id, r.exam_type || 'Annual', r.session || '2024-25', r.hindi, r.english, r.maths, r.science, r.sst, total, percentage, grade, status]
      });
      imported++;
    } catch (e) { continue; }
  }

  // Recalculate all ranks
  const classes = await db.execute('SELECT DISTINCT class FROM students');
  for (const { class: cls } of classes.rows) {
    const classResults = await db.execute({
      sql: `SELECT r.id FROM results r 
            JOIN students s ON r.student_id = s.id 
            WHERE s.class = ? ORDER BY r.percentage DESC`,
      args: [cls]
    });
    for (let i = 0; i < classResults.rows.length; i++) {
      await db.execute({
        sql: 'UPDATE results SET rank = ? WHERE id = ?',
        args: [i + 1, classResults.rows[i].id]
      });
    }
  }

  res.json({ success: true, imported });
});

module.exports = router;