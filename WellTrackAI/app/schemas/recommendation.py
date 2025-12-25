from pydantic import BaseModel
from typing import Dict, Any

class RecommendationRequest(BaseModel):
    habit: Dict[str, Any]
    mood: Dict[str, Any]
    sleep: Dict[str, Any]
    steps: int
    water_liters: float
    calories: int
    protein: float
    carbs: float
    fat: float


class RecommendationResponse(BaseModel):
    summary: str
    action_items: list[str]
