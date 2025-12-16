from pydantic import BaseModel

class MoodPredictionRequest(BaseModel):
    sleep_hours: float
    sleep_quality: int      # 0=Poor, 1=Average, 2=Good
    water_liters: float
    steps_count: int
    activity_type: int      # 0=Walking, 1=Running, 2=Cycling, 3=Hiking
    calories: int
    protein: float
    carbs: float
    fat: float
    habit_completion_ratio: float


class MoodPredictionResponse(BaseModel):
    predicted_mood: str
    confidence: float
