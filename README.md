# ResumeForge

End‑to‑end resume analysis platform with ATS scoring, keyword coverage, and actionable suggestions.

## Repos
- `frontend/` React + Vite UI
- `backend/` Express API
- `ml_service/` FastAPI ML scoring service

## Quick Start
```bash
# 1) ML service
cd ml_service
python3 -m pip install -r requirements.txt
python3 tools/download_model.py
uvicorn main:app --reload --port 8000

# 2) Backend
cd ../backend
npm install
npm start

# 3) Frontend
cd ../frontend
npm install
npm run dev
```

## Deploy (Free)
### Render (backend + ML)
1. Go to Render → New → “Blueprint” and select your GitHub repo.
2. Render will pick up `render.yaml` and create two services:
   - `resumeforge-ml`
   - `resumeforge-backend`
3. After ML service is deployed, copy its URL into the backend service env:
   - `ML_SERVICE_URL=https://<your-ml>.onrender.com`

### Vercel (frontend)
1. Vercel → New Project → import repo.
2. Set **Root Directory** to `frontend/`.
3. Build command: `npm run build` and Output: `dist`
4. Add env:
   - `VITE_API_BASE_URL=https://<your-backend>.onrender.com`
   - Firebase vars from `.env`

## Environment
Create `/Users/rishavraj/Proj/Track/resume-wow/frontend/.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Notes
- Email verification is required to view analysis results.
- Password reset uses a custom page (set Firebase Action URL to your app).
