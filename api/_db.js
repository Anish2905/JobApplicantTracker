const { createClient } = require('@libsql/client');

let db = null;

function getDb() {
    if (!db) {
        db = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }
    return db;
}

async function initSchema() {
    const db = getDb();
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            pin_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            company TEXT NOT NULL,
            position TEXT NOT NULL,
            status TEXT DEFAULT 'wishlist',
            applied_date TEXT,
            url TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_applications_updated ON applications(updated_at)`);
}

module.exports = { getDb, initSchema };
