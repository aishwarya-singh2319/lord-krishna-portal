const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
await db.execute(`CREATE TABLE IF NOT EXISTS students (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    class       TEXT NOT NULL,
    roll_no     TEXT NOT NULL UNIQUE,
    phone       TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    aadhar_no   TEXT,
    sr_number   TEXT,
    address     TEXT,
    photo_url   TEXT,
    admitted_on TEXT DEFAULT (date('now')),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add new columns to existing table if they don't exist
  const addCols = [
    `ALTER TABLE students ADD COLUMN father_name TEXT`,
    `ALTER TABLE students ADD COLUMN mother_name TEXT`,
    `ALTER TABLE students ADD COLUMN aadhar_no TEXT`,
    `ALTER TABLE students ADD COLUMN pan_number TEXT`,
    `ALTER TABLE students ADD COLUMN dob TEXT`,
    `ALTER TABLE students ADD COLUMN caste TEXT`,
    `ALTER TABLE fee_receipts ADD COLUMN months TEXT`,
    `ALTER TABLE fee_receipts ADD COLUMN fee_type TEXT`,
  ];
  for (const sql of addCols) {
    try { await db.execute(sql); } catch (e) { /* column already exists */ }
  }

  await db.execute(`CREATE TABLE IF NOT EXISTS fees (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_fees  REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS fee_receipts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  INTEGER REFERENCES students(id),
    receipt_no  TEXT UNIQUE,
    amount_paid REAL,
    paid_on     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_type   TEXT DEFAULT 'Annual',
    session     TEXT DEFAULT '2024-25',
    hindi       REAL DEFAULT 0,
    english     REAL DEFAULT 0,
    maths       REAL DEFAULT 0,
    science     REAL DEFAULT 0,
    sst         REAL DEFAULT 0,
    total       REAL DEFAULT 0,
    percentage  REAL DEFAULT 0,
    grade       TEXT DEFAULT 'F',
    rank        INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'Fail',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ Turso Database connected and tables ready');
}

initDB().catch(console.error);

module.exports = db;