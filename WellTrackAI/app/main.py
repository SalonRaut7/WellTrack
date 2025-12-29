from fastapi import FastAPI
from app.routes import mood, sleep, habit, all_in_one, motivation
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="WellTrack AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(mood.router, prefix="/predict")
app.include_router(sleep.router, prefix="/predict")
app.include_router(habit.router, prefix="/predict")


app.include_router(all_in_one.router, prefix="/predict")
app.include_router(motivation.router, prefix="/motivation")

