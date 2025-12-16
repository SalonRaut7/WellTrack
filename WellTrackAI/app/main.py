from fastapi import FastAPI
from app.routes import mood, sleep, habit

app = FastAPI(title="WellTrack AI Service")

app.include_router(mood.router, prefix="/predict")
app.include_router(sleep.router, prefix="/predict")
app.include_router(habit.router, prefix="/predict")
