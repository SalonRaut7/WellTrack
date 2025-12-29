from fastapi import APIRouter
from datetime import date
from app.schemas.motivation import DailyMotivationResponse
from app.services.motivation_llm import generate_daily_motivation

router = APIRouter(tags=["Motivation"])

@router.post(
    "/daily",
    response_model=DailyMotivationResponse
)
def get_daily_motivation():
    """
    Returns a short motivational message for today.
    The date is automatically set to today.
    """
    today = date.today()
    message = generate_daily_motivation(today)

    return DailyMotivationResponse(
        date=today,
        message=message
    )
