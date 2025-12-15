const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, getDb, saveDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ===== API Routes =====

// GET all applications
app.get('/api/applications', (req, res) => {
    try {
        const db = getDb();
        const results = db.exec('SELECT * FROM applications ORDER BY created_at DESC');

        if (results.length === 0) {
            return res.json([]);
        }

        const columns = results[0].columns;
        const rows = results[0].values;

        const applications = rows.map(row => {
            const obj = {};
            columns.forEach((col, i) => {
                // Convert snake_case to camelCase
                const key = col.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                obj[key] = row[i];
            });
            return obj;
        });

        res.json(applications);
    } catch (error) {
        console.error('GET error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// POST new application
app.post('/api/applications', (req, res) => {
    try {
        const db = getDb();
        const { id, company, position, status, appliedDate, url, notes, createdAt, updatedAt } = req.body;

        db.run(`
      INSERT INTO applications (id, company, position, status, applied_date, url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, company, position, status || 'wishlist', appliedDate || null, url || null, notes || null, createdAt, updatedAt]);

        saveDatabase();
        res.status(201).json({ success: true, id });
    } catch (error) {
        console.error('POST error:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// PUT update application
app.put('/api/applications/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const { company, position, status, appliedDate, url, notes, updatedAt } = req.body;

        db.run(`
      UPDATE applications 
      SET company = ?, position = ?, status = ?, applied_date = ?, url = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [company, position, status, appliedDate || null, url || null, notes || null, updatedAt, id]);

        saveDatabase();
        res.json({ success: true });
    } catch (error) {
        console.error('PUT error:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// DELETE application
app.delete('/api/applications/:id', (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        db.run('DELETE FROM applications WHERE id = ?', [id]);
        saveDatabase();

        res.json({ success: true });
    } catch (error) {
        console.error('DELETE error:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// Restore application (for undo functionality)
app.post('/api/applications/restore', (req, res) => {
    try {
        const db = getDb();
        const { id, company, position, status, appliedDate, url, notes, createdAt, updatedAt } = req.body;

        db.run(`
      INSERT INTO applications (id, company, position, status, applied_date, url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, company, position, status, appliedDate || null, url || null, notes || null, createdAt, updatedAt]);

        saveDatabase();
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('RESTORE error:', error);
        res.status(500).json({ error: 'Failed to restore application' });
    }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
