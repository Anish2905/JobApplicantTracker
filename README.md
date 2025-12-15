# Job Applicant Tracker

A local-first, offline-capable job application tracking system with cloud sync.

🔗 **Live:** [job-tracker-gamma-liard.vercel.app](https://job-tracker-gamma-liard.vercel.app)

![Status](https://img.shields.io/badge/Status-Production-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### Core
- 📋 **Track Applications** - Company, position, status, date, URL, notes
- 🔄 **Status Workflow** - Wishlist → Applied → Interview → Offer → Accepted/Rejected
- 🔍 **Filter & Sort** - By status, date, or company name
- 📥 **Export to CSV** - Download all applications

### Multi-User Auth
- 🔐 **Username + 4-Digit PIN** - Simple, secure login
- 🔐 **JWT Tokens** - 30-day sessions
- 🔐 **Data Isolation** - Each user sees only their data

### Local-First Architecture
- 📱 **Works Offline** - Data stored in browser (IndexedDB)
- ☁️ **Cloud Sync** - Syncs to Turso when online
- ⚡ **Instant UI** - No loading spinners
- 🟢 **Sync Status** - Visual indicator (Online/Offline)

### Premium UI
- 🌙 **Dark Mode** - Toggle on any page
- 🌊 **Animated Background** - Flowing gradient on auth page
- 📱 **Pull-to-Refresh** - Mobile swipe gesture
- 📅 **Interview Reminders** - Highlighted cards with calendar icon
- ⚠️ **Delete Confirmation** - Modal before permanent delete
- ✨ **Micro-animations** - Smooth hover effects and transitions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla HTML/CSS/JS |
| **Local Storage** | IndexedDB |
| **Backend API** | Vercel Serverless Functions |
| **Cloud Database** | Turso (libSQL) |
| **Auth** | JWT + bcrypt |

---

## 📁 Project Structure

```
JobScheduleTracker/
├── public/
│   └── index.html          # Frontend (all-in-one)
├── api/
│   ├── _db.js              # Turso connection
│   ├── auth.js             # Login/Register
│   └── sync.js             # Cloud sync
├── server/                 # Legacy Express (Railway)
├── vercel.json             # Vercel config
└── package.json
```

---

## 🚀 Deployment

### Vercel + Turso (Recommended - Free)

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

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth` | POST | Login/Register `{username, pin, action}` |
| `/api/sync` | GET | Fetch changes since `?since=timestamp` |
| `/api/sync` | POST | Push local changes |

---

## 🎨 Design System

- **Colors:** HSL format throughout
- **Shadows:** Button 1/2px, Card 4/8px, Modal 12/24px
- **Touch Targets:** Minimum 44px
- **Typography:** Inter font, 1.5-1.7 line-height
- **Spacing:** 4, 8, 12, 16, 24, 32, 48, 64px scale

---

## 📄 License

MIT
