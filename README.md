# Job Applicant Tracker

Track your job applications across all your devices.

## Quick Start (Local)

```bash
cd server
npm install
npm start
```

Open http://localhost:3000

---

## Deploy to Railway (Free)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects Node.js and deploys
5. Get your public URL from the dashboard

---

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
5. Deploy and get your public URL

---

## Access from Phone

After deploying, open the public URL on any device.

---

## Project Structure

```
JobScheduleTracker/
├── server/
│   ├── package.json    # Dependencies
│   ├── server.js       # Express API
│   ├── database.js     # SQLite setup
│   └── applications.db # Data (auto-created)
├── public/
│   └── index.html      # Frontend
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List all |
| POST | `/api/applications` | Create |
| PUT | `/api/applications/:id` | Update |
| DELETE | `/api/applications/:id` | Delete |
