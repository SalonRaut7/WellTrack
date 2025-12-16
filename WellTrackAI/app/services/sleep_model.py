import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models")

sleep_model = joblib.load(os.path.join(MODEL_DIR, "sleep_model.pkl"))

SLEEP_LABELS = {
    0: "Poor",
    1: "Average",
    2: "Good"
}

