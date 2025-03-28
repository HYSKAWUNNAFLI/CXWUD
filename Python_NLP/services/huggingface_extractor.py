from transformers import pipeline
import re
from services.duckling_helper import extract_datetime

nlp_pipeline = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

def extract_entities(text: str):
    ner_results = nlp_pipeline(text)
    persons = [ent["word"].replace("##", "") for ent in ner_results if ent["entity_group"] == "PER"]
    assignee = persons[0] if persons else "Unknown"

    due_date = extract_datetime(text)

    cleaned_text = text
    for person in persons:
        cleaned_text = re.sub(person, "", cleaned_text, flags=re.IGNORECASE)
    task_name = re.sub(r"\s{2,}", " ", cleaned_text).strip().capitalize()

    tasks = [{
        "task_name": task_name,
        "assignee": assignee,
        "due_date": due_date.split("T")[0] if due_date else None
    }]

    return {
        "meeting_date": due_date.split("T")[0] if due_date else None,
        "tasks": tasks
    }
