import pandas as pd
import random

random.seed(42)

TARGET_PER_CLASS = 200
data = []

def generate_row(mood):
    if mood in ["Happy", "Relaxed"]:
        sleep_hours = round(random.uniform(7, 9), 1)
        water_liters = round(random.uniform(2.5, 4.0), 1)
        steps = random.randint(8000, 12000)
        habit_ratio = round(random.uniform(0.7, 1.0), 2)
    elif mood in ["Sad", "Angry"]:
        sleep_hours = round(random.uniform(3, 5), 1)
        water_liters = round(random.uniform(0.5, 1.5), 1)
        steps = random.randint(1000, 4000)
        habit_ratio = round(random.uniform(0.0, 0.4), 2)
    else:  # Neutral
        sleep_hours = round(random.uniform(5.5, 7), 1)
        water_liters = round(random.uniform(1.5, 2.5), 1)
        steps = random.randint(4000, 8000)
        habit_ratio = round(random.uniform(0.4, 0.7), 2)

    return [
        sleep_hours,
        random.choice([0, 1, 2]),  # sleep quality
        water_liters,
        steps,
        random.choice([0, 1, 2, 3]),
        random.randint(1800, 3200),
        round(random.uniform(40, 150), 1),
        round(random.uniform(150, 400), 1),
        round(random.uniform(40, 120), 1),
        habit_ratio,
        mood
    ]

for mood in ["Happy", "Relaxed", "Neutral", "Sad", "Angry"]:
    for _ in range(TARGET_PER_CLASS):
        data.append(generate_row(mood))

columns = [
    "sleep_hours",
    "sleep_quality",
    "water_liters",
    "steps_count",
    "activity_type",
    "calories",
    "protein",
    "carbs",
    "fat",
    "habit_completion_ratio",
    "mood"
]

df = pd.DataFrame(data, columns=columns)
df.to_csv("data/mood_dummy_data.csv", index=False)

print("Balanced dummy dataset created:", df["mood"].value_counts())
