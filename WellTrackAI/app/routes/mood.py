from fastapi import APIRouter
import numpy as np

from app.schemas.mood import MoodPredictionRequest, MoodPredictionResponse
from app.services.mood_model import mood_model, mood_label_encoder

router = APIRouter(tags=["Mood"])

@router.post("/mood", response_model=MoodPredictionResponse)
def predict_mood(data: MoodPredictionRequest):

    features = np.array([[
        data.sleep_hours,
        data.sleep_quality,
        data.water_liters,
        data.steps_count,
        data.activity_type,
        data.calories,
        data.protein,
        data.carbs,
        data.fat,
        data.habit_completion_ratio
    ]])

    probabilities = mood_model.predict_proba(features)[0]
    predicted_index = int(np.argmax(probabilities))

    predicted_mood = mood_label_encoder.inverse_transform([predicted_index])[0]
    confidence = float(probabilities[predicted_index])

    return {
        "predicted_mood": predicted_mood,
        "confidence": round(confidence, 3)
    }
