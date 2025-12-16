from fastapi import APIRouter
import numpy as np

from app.schemas.sleep import SleepPredictionRequest, SleepPredictionResponse
from app.services.sleep_model import sleep_model, SLEEP_LABELS

router = APIRouter(tags=["Sleep"])

@router.post("/sleep", response_model=SleepPredictionResponse)
def predict_sleep(data: SleepPredictionRequest):

    features = np.array([[
        data.steps_count,
        data.activity_type,
        data.water_liters,
        data.calories,
        data.protein,
        data.carbs,
        data.fat,
        data.habit_completion_ratio,
        data.mood
    ]])

    probabilities = sleep_model.predict_proba(features)[0]
    predicted_index = int(np.argmax(probabilities))

    return {
        "predicted_sleep_quality": SLEEP_LABELS[predicted_index],
        "confidence": round(float(probabilities[predicted_index]), 3)
    }
