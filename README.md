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
