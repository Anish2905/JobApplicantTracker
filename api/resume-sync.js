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
            const { id } = req.query;

            // 1. Fetch Request: Get single resume with FULL data
            if (id) {
                console.log(`[Resume API] GET single resume. userId=${userId}, resumeId=${id}`);

                const result = await db.execute({
                    sql: `SELECT id, name, file_name, file_data, file_type, created_at, updated_at 
                          FROM resumes WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
                    args: [id, userId]
                });

                console.log(`[Resume API] Query returned ${result.rows.length} rows`);

                if (result.rows.length === 0) {
                    console.log(`[Resume API] Resume NOT FOUND. Checking if exists with different user...`);
                    // Debug: Check if resume exists but belongs to different user
                    const anyUser = await db.execute({
                        sql: `SELECT user_id FROM resumes WHERE id = ?`,
                        args: [id]
                    });
                    if (anyUser.rows.length > 0) {
                        console.log(`[Resume API] Resume exists but belongs to user: ${anyUser.rows[0].user_id}`);
                    } else {
                        console.log(`[Resume API] Resume ID does not exist in database at all`);
                    }
                    return res.status(404).json({ error: 'Resume not found' });
                }

                const row = result.rows[0];
                console.log(`[Resume API] Returning resume: ${row.file_name}, dataLength=${row.file_data?.length || 0}`);
                return res.json({
                    resume: {
                        id: row.id,
                        name: row.name,
                        fileName: row.file_name,
                        fileData: row.file_data, // Send data only when requested
                        fileType: row.file_type,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at
                    }
                });
            }

            // 2. Sync Request: Get ALL resumes metadata ONLY (no file_data)
            const result = await db.execute({
                sql: `SELECT id, name, file_name, file_type, created_at, updated_at 
                      FROM resumes WHERE user_id = ? AND deleted_at IS NULL
                      ORDER BY created_at DESC`,
                args: [userId]
            });

            const resumes = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                fileName: row.file_name,
                // fileData omitted for list view
                fileType: row.file_type,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            return res.json({ resumes });
        }

        if (req.method === 'POST') {
            const { action, resume } = req.body;

            if (action === 'upload') {
                console.log(`[Resume API] POST upload. userId=${userId}, resumeId=${resume.id}, fileName=${resume.fileName}`);
                // Upload new resume
                await db.execute({
                    sql: `INSERT INTO resumes (id, user_id, name, file_name, file_data, file_type, created_at, updated_at)
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    args: [resume.id, userId, resume.name, resume.fileName, resume.fileData,
                    resume.fileType, resume.createdAt, resume.updatedAt]
                });
                console.log(`[Resume API] Upload SUCCESS for resumeId=${resume.id}`);
                return res.json({ success: true });
            }

            if (action === 'delete') {
                // Soft delete
                await db.execute({
                    sql: `UPDATE resumes SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
                    args: [new Date().toISOString(), new Date().toISOString(), resume.id, userId]
                });
                return res.json({ success: true });
            }

            return res.status(400).json({ error: 'Invalid action' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Resume sync error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
