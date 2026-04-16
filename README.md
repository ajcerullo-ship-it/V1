# Distressed Property Lead Finder

AI-powered real estate lead scoring app. Upload a Propstream CSV, get Street View + satellite images fetched automatically, and Claude scores each property for distress (1-10).

## Setup

### 1. API Keys
Copy and fill in your keys:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env`:
```
GOOGLE_MAPS_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
PORT=3001
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Run
Terminal 1 (backend):
```bash
cd backend && npm run dev
```
Terminal 2 (frontend):
```bash
cd frontend && npm start
```

Open http://localhost:3000

## Workflow
1. Export filtered CSV from Propstream
2. Upload CSV in the app
3. Click "Score All" or score individual leads
4. Filter by score (7+ = high priority motivated sellers)
5. Export scored leads as CSV

## Google Maps API
Enable these APIs in Google Cloud Console:
- Street View Static API
- Maps Static API
