from fastapi import APIRouter
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.services.habit_model import predict_habit
from app.services.mood_model import mood_model, mood_label_encoder
from app.services.sleep_model import sleep_model, SLEEP_LABELS
from app.services.recommendation_rules import generate_rule_based_context
from app.services.groq_llm import generate_llm_recommendation

router = APIRouter(tags=["AllInOne"])

@router.post("/predict-all", response_model=RecommendationResponse)
def predict_all(data: RecommendationRequest):
    sleep_quality_map = {"Poor": 0, "Average": 1, "Good": 2}
    mood_value_map = {
        "Angry": 0,
        "Sad": 1,
        "Neutral": 2,
        "Relaxed": 3,
        "Happy": 4
    } 

    sleep_quality = data.sleep.get("quality", 1)
    if isinstance(sleep_quality, str):
        sleep_quality = sleep_quality_map.get(sleep_quality, 1)

    mood_value = data.mood.get("value", 1)
    if isinstance(mood_value, str):
        mood_value = mood_value_map.get(mood_value, 1)

    habit_features = [
        float(data.habit.get("previous_habit_ratio", 0)),
        float(data.sleep.get("hours", 0)),
        float(sleep_quality),        
        float(data.water_liters),
        float(data.steps),
        float(data.calories),
        float(data.protein),
        float(data.carbs),
        float(data.fat),
        float(mood_value)             
    ]
    habit_pred, habit_conf = predict_habit(habit_features)
    habit_result = {"predicted_success": habit_pred, "confidence": round(habit_conf, 3)}

    mood_features = [[
        float(data.sleep.get("hours", 0)),
        float(sleep_quality),
        float(data.water_liters),
        float(data.steps),
        float(data.mood.get("activity_type", 0)),
        float(data.calories),
        float(data.protein),
        float(data.carbs),
        float(data.fat),
        habit_result["confidence"]
    ]]
    mood_prob = mood_model.predict_proba(mood_features)[0]
    mood_index = int(mood_prob.argmax())
    mood_result = {
        "predicted_mood": mood_label_encoder.inverse_transform([mood_index])[0],
        "confidence": round(float(mood_prob[mood_index]), 3)
    }

    sleep_features = [[
        float(data.steps),
        float(data.mood.get("activity_type", 0)),
        float(data.water_liters),
        float(data.calories),
        float(data.protein),
        float(data.carbs),
        float(data.fat),
        habit_result["confidence"],
        mood_result["confidence"]
    ]]
    sleep_prob = sleep_model.predict_proba(sleep_features)[0]
    sleep_index = int(sleep_prob.argmax())
    sleep_result = {
        "predicted_sleep_quality": SLEEP_LABELS[sleep_index],
        "confidence": round(float(sleep_prob[sleep_index]), 3)
    }

    context_points = generate_rule_based_context({
        "habit": habit_result,
        "mood": mood_result,
        "sleep": sleep_result,
        "steps": data.steps,
        "water_liters": data.water_liters,
        "calories": data.calories,
        "protein": data.protein,
        "carbs": data.carbs,
        "fat": data.fat
    })

    llm_result = generate_llm_recommendation(context_points)

    return llm_result
