# ML Service

FastAPI scoring service for ResumeForge.

## Run
```bash
python3 -m pip install -r requirements.txt
python3 tools/download_model.py
uvicorn main:app --reload --port 8000
```

## Tests
```bash
pytest
```

## Notes
- Local model is stored in `ml_service/models/all-mpnet-base-v2`.
