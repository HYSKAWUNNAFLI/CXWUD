from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from services.huggingface_extractor import extract_entities

app = FastAPI(
    title="Python NLP Microservice (HuggingFace)",
    version="1.0",
    description="Trích xuất task từ biên bản họp"
)

class ExtractRequest(BaseModel):
    text: str

class TaskItem(BaseModel):
    task_name: str
    assignee: str
    due_date: Optional[str]

class ExtractResponse(BaseModel):
    meeting_date: Optional[str]
    tasks: List[TaskItem]

@app.post("/extract-tasks", response_model=ExtractResponse)
def extract_tasks(req: ExtractRequest):
    """
    Gửi text -> Trả về tasks + meeting_date
    """
    result = extract_entities(req.text)
    return result

# Cách chạy:
# uvicorn main:app --reload --port 5001
