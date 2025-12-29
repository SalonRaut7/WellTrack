from pydantic import BaseModel
from datetime import date


class DailyMotivationRequest(BaseModel):
    date: date


class DailyMotivationResponse(BaseModel):
    date: date
    message: str
