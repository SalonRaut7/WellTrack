import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models")

mood_model = joblib.load(os.path.join(MODEL_DIR, "mood_model.pkl"))
mood_label_encoder = joblib.load(os.path.join(MODEL_DIR, "mood_label_encoder.pkl"))

