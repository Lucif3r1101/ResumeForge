from fastapi import FastAPI
from pydantic import BaseModel
from scorer import final_score

app = FastAPI()

class AnalyzeRequest(BaseModel):
    resume: str
    job_description: str

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    return final_score(data.resume, data.job_description)