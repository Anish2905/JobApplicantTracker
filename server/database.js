const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'applications.db');
let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database if it exists
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'wishlist',
      applied_date TEXT,
      url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  saveDatabase();
  return db;
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function getDb() {
  return db;
}

module.exports = { initDatabase, getDb, saveDatabase };
