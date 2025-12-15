const jwt = require('jsonwebtoken');
const { getDb, initSchema } = require('./_db');

const JWT_SECRET = process.env.JWT_SECRET || 'job-tracker-secret-change-in-production';

function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        return jwt.verify(authHeader.substring(7), JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const decoded = verifyToken(req.headers.authorization);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
    const userId = decoded.userId;

    try {
        await initSchema();
        const db = getDb();

        if (req.method === 'GET') {
            // Get all applications for user (including soft-deleted for sync)
            const lastSync = req.query.since || '1970-01-01T00:00:00.000Z';
            const result = await db.execute({
                sql: `SELECT id, company, position, status, applied_date, url, notes, resume_id,
                      created_at, updated_at, deleted_at 
                      FROM applications 
                      WHERE user_id = ? AND updated_at > ?
                      ORDER BY updated_at DESC`,
                args: [userId, lastSync]
            });

            const applications = result.rows.map(row => ({
                id: row.id,
                company: row.company,
                position: row.position,
                status: row.status,
                appliedDate: row.applied_date,
                url: row.url,
                notes: row.notes,
                resumeId: row.resume_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deletedAt: row.deleted_at
            }));

            return res.json({ applications, serverTime: new Date().toISOString() });
        }

        if (req.method === 'POST') {
            // Sync: receive local changes, return server changes
            const { changes, lastSync } = req.body;

            // Apply incoming changes (upsert with last-write-wins)
            for (const app of changes || []) {
                const existing = await db.execute({
                    sql: 'SELECT updated_at FROM applications WHERE id = ? AND user_id = ?',
                    args: [app.id, userId]
                });

                if (existing.rows.length === 0) {
                    // Insert new
                    await db.execute({
                        sql: `INSERT INTO applications 
                              (id, user_id, company, position, status, applied_date, url, notes, resume_id, created_at, updated_at, deleted_at)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        args: [app.id, userId, app.company, app.position, app.status || 'wishlist',
                        app.appliedDate || null, app.url || null, app.notes || null, app.resumeId || null,
                        app.createdAt, app.updatedAt, app.deletedAt || null]
                    });
                } else {
                    // Update if incoming is newer
                    const serverUpdated = existing.rows[0].updated_at;
                    if (app.updatedAt > serverUpdated) {
                        await db.execute({
                            sql: `UPDATE applications SET 
                                  company = ?, position = ?, status = ?, applied_date = ?, 
                                  url = ?, notes = ?, resume_id = ?, updated_at = ?, deleted_at = ?
                                  WHERE id = ? AND user_id = ?`,
                            args: [app.company, app.position, app.status, app.appliedDate || null,
                            app.url || null, app.notes || null, app.resumeId || null, app.updatedAt, app.deletedAt || null,
                            app.id, userId]
                        });
                    }
                }
            }

            // Return server changes since lastSync
            const result = await db.execute({
                sql: `SELECT id, company, position, status, applied_date, url, notes, resume_id,
                      created_at, updated_at, deleted_at 
                      FROM applications 
                      WHERE user_id = ? AND updated_at > ?
                      ORDER BY updated_at DESC`,
                args: [userId, lastSync || '1970-01-01T00:00:00.000Z']
            });

            const applications = result.rows.map(row => ({
                id: row.id,
                company: row.company,
                position: row.position,
                status: row.status,
                appliedDate: row.applied_date,
                url: row.url,
                notes: row.notes,
                resumeId: row.resume_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                deletedAt: row.deleted_at
            }));

            return res.json({ applications, serverTime: new Date().toISOString() });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Sync error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
