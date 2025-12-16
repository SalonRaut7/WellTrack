from pydantic import BaseModel

class HabitPredictionRequest(BaseModel):
    previous_habit_ratio: float
    sleep_hours: float
    sleep_quality: int
    water_liters: float
    steps_count: int
    calories: int
    protein: float
    carbs: float
    fat: float
    mood: int 

class HabitPredictionResponse(BaseModel):
    predicted_success: int
    confidence: float
