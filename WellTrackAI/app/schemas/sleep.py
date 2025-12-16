from pydantic import BaseModel

class SleepPredictionRequest(BaseModel):
    steps_count: int
    activity_type: int
    water_liters: float
    calories: int
    protein: float
    carbs: float
    fat: float
    habit_completion_ratio: float
    mood: int  


class SleepPredictionResponse(BaseModel):
    predicted_sleep_quality: str
    confidence: float
