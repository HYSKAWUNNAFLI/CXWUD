from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import spacy
import re
from datetime import datetime
import json

app = FastAPI(title="Meeting Minutes NLP Service")

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

# === Models ===
class TextInput(BaseModel):
    text: str

class Task(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    deadline: Optional[str] = None

# === Routes ===

@app.get("/")
def root():
    return {"message": "✅ FastAPI NLP Service is running!"}

@app.post("/api/extract-tasks")
async def extract_tasks(input_data: TextInput) -> List[Task]:
    print("Received Text:", input_data.text)
    try:
        doc = nlp(input_data.text)
        tasks = []

        task_patterns = [
            r"(?:need to|should|must|have to|will|going to)\s+([^.!?]+)[.!?]",
            r"(?:TODO|TASK|ACTION ITEM):\s*([^.!?]+)[.!?]",
            r"(?:assign|assigned to)\s+([^.!?]+)\s+(?:to|for)\s+([^.!?]+)[.!?]"
        ]

        for pattern in task_patterns:
            matches = re.finditer(pattern, input_data.text, re.IGNORECASE)
            for match in matches:
                if len(match.groups()) == 1:
                    title = match.group(1).strip()
                else:
                    title = f"{match.group(2).strip()} - {match.group(1).strip()}"
                tasks.append(Task(title=title, description=title))

        return tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract-dates")
async def extract_dates(input_data: TextInput) -> List[str]:
    try:
        doc = nlp(input_data.text)
        return [ent.text for ent in doc.ents if ent.label_ in ["DATE", "TIME"]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract-assignees")
async def extract_assignees(input_data: TextInput) -> List[str]:
    try:
        doc = nlp(input_data.text)
        return [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
