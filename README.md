# Job Applicant Tracker

A local-first, offline-capable job application tracking system with cloud sync.

![Job Tracker](https://img.shields.io/badge/Status-Production-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

### Core Features
- ✅ **Track Applications** - Company, position, status, date, URL, notes
- ✅ **Status Workflow** - Wishlist → Applied → Interview → Offer → Accepted/Rejected
- ✅ **Filter & Sort** - By status, date, or company name
- ✅ **Export to CSV** - Download all applications as spreadsheet

### Multi-User Authentication
- 🔐 **Username + 4-Digit PIN** - Simple, secure login
- 🔐 **JWT Tokens** - 30-day sessions
- 🔐 **Data Isolation** - Each user sees only their data

### Local-First Architecture
- 📱 **Works Offline** - Data stored in browser (IndexedDB)
- 🔄 **Cloud Sync** - Syncs to server when online
- ⚡ **Instant UI** - No loading spinners, immediate feedback
- 🟡 **Sync Status** - Visual indicator (Synced/Pending/Offline)

### Premium UI
- 🌙 **Dark Mode** - Toggle on login and app pages
- 🎨 **HSL Color System** - Consistent, accessible palette
- 📱 **Responsive** - Works on mobile and desktop
- ✨ **Micro-animations** - Smooth hover effects and transitions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla HTML/CSS/JS |
| **Local Storage** | IndexedDB |
| **Backend API** | Vercel Serverless Functions |
| **Cloud Database** | Turso (libSQL) |
| **Auth** | JWT + bcrypt |

---

## Project Structure

```
JobScheduleTracker/
├── public/
│   └── index.html          # Frontend (all-in-one HTML)
├── api/
│   ├── _db.js              # Turso database connection
│   ├── auth.js             # Login/Register endpoint
│   └── sync.js             # Cloud sync endpoint
├── server/                  # Legacy Express server (for Railway)
│   ├── server.js
│   ├── database.js
│   └── package.json
├── vercel.json             # Vercel deployment config
└── package.json            # Root dependencies
```

---

## Deployment Options

### Option 1: Vercel + Turso (Recommended - Free)

1. **Create Turso database:**
   ```bash
   turso auth login
   turso db create job-tracker
   turso db tokens create job-tracker
   ```

2. **Deploy to Vercel:**
   - Import repo at [vercel.com](https://vercel.com)
   - Add environment variables:
     - `TURSO_DATABASE_URL`
     - `TURSO_AUTH_TOKEN`
     - `JWT_SECRET`

### Option 2: Railway (Current)

- Deploys Express server with in-memory SQLite
- Add volume for persistence

### Option 3: Self-Host

```bash
cd server
npm install
npm start
# Server runs at http://localhost:3000
```

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Applications  
CREATE TABLE applications (
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
    deleted_at TEXT,  -- Soft delete for sync
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST | Login/Register with `{username, pin, action}` |
| `/api/sync` | GET | Fetch changes since `?since=timestamp` |
| `/api/sync` | POST | Push local changes, receive server changes |

---

## Sync Strategy

**Last-Write-Wins with Timestamps:**
1. Every record has `updatedAt` timestamp
2. On sync: compare local vs cloud `updatedAt`
3. Newer version wins
4. Deletes are soft (tracked via `deletedAt`)

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TURSO_DATABASE_URL` | Turso database URL | Yes (Vercel) |
| `TURSO_AUTH_TOKEN` | Turso auth token | Yes (Vercel) |
| `JWT_SECRET` | Secret for signing tokens | Yes |
| `PORT` | Server port (default: 3000) | No |

---

## Design Rules Applied

- **HSL Colors** - All colors use HSL format
- **Shadow Elevation** - Button: 1/2px, Card: 4/8px, Modal: 12/24px
- **Touch Targets** - Minimum 44px for interactive elements
- **Typography** - Inter font, line-height 1.5-1.7 for body
- **Spacing Scale** - 4, 8, 12, 16, 24, 32, 48, 64px

---

## License

MIT
