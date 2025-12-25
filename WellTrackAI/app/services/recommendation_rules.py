def generate_rule_based_context(data: dict) -> list[str]:
    insights = []

    habit = data["habit"]
    mood = data["mood"]
    sleep = data["sleep"]

    if habit["confidence"] < 0.4:
        insights.append("Your habit success probability is low tomorrow")

    if sleep["predicted_sleep_quality"] == "Poor":
        insights.append(f"Your predicted sleep quality is poor ({sleep.get('confidence',0):.2f} confidence)")

    if sleep.get("steps_count", 0) < 5000:
        insights.append("Your daily steps are low, which may affect energy levels")

    if mood["predicted_mood"] in ["Sad", "Angry"]:
        insights.append(f"Mood is negative: {mood['predicted_mood']}")

    if data["water_liters"] < 2:
        insights.append(f"Water intake is low ({data['water_liters']}L)")

    if data["protein"] < 60:
        insights.append(f"Protein intake is insufficient ({data['protein']}g)")

    if data["carbs"] > 350:
        insights.append(f"High carbohydrate intake ({data['carbs']}g) — may affect energy and mood")

    if data["fat"] > 100:
        insights.append(f"High fat intake ({data['fat']}g) — consider lighter meals")

    if data["steps"] < 5000:
        insights.append(f"Daily steps are low ({data['steps']}) — try to move more")

    return insights
