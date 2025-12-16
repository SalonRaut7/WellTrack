import os
import joblib
import numpy as np


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODEL_DIR, "habit_model.pkl")

habit_model = joblib.load(MODEL_PATH)

def predict_habit(features: list):
    features = np.array([features])
    proba = habit_model.predict_proba(features)[0]
    pred_index = np.argmax(proba)
    confidence = float(proba[pred_index])
    return int(pred_index), confidence
