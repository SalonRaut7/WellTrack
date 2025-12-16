from fastapi import APIRouter
from app.schemas.habit import HabitPredictionRequest, HabitPredictionResponse
from app.services.habit_model import predict_habit

router = APIRouter(tags=["Habit"])

@router.post("/habit", response_model=HabitPredictionResponse)
def predict_habit_endpoint(data: HabitPredictionRequest):
    features = [
        data.previous_habit_ratio,
        data.sleep_hours,
        data.sleep_quality,
        data.water_liters,
        data.steps_count,
        data.calories,
        data.protein,
        data.carbs,
        data.fat,
        data.mood
    ]
    pred, conf = predict_habit(features)
    return {"predicted_success": pred, "confidence": round(conf, 3)}
