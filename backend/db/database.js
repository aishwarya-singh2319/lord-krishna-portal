const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'school.db'));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    class       TEXT NOT NULL,
    roll_no     TEXT NOT NULL UNIQUE,
    phone       TEXT NOT NULL,
    email       TEXT,
    address     TEXT,
    photo_url   TEXT,
    admitted_on TEXT DEFAULT (date('now')),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fees (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_fees  REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fee_receipts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  INTEGER REFERENCES students(id),
    receipt_no  TEXT UNIQUE,
    amount_paid REAL,
    paid_on     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Database connected');
module.exports = db;