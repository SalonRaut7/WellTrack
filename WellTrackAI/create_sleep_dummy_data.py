import pandas as pd
import random

random.seed(42)

ROWS_PER_CLASS = 400
data = []

def generate_row(sleep_quality):
    if sleep_quality == 2:  # GOOD
        steps = random.randint(8000, 12000)
        water = round(random.uniform(2.5, 4.0), 1)
        calories = random.randint(2200, 3000)
        habit_ratio = round(random.uniform(0.7, 1.0), 2)
        mood = random.choice([3, 4])  # Relaxed, Happy

    elif sleep_quality == 1:  # AVERAGE
        steps = random.randint(4000, 8000)
        water = round(random.uniform(1.5, 2.5), 1)
        calories = random.randint(1800, 2600)
        habit_ratio = round(random.uniform(0.4, 0.7), 2)
        mood = random.choice([2, 3])  # Neutral, Relaxed

    else:  # POOR
        steps = random.randint(1000, 4000)
        water = round(random.uniform(0.5, 1.5), 1)
        calories = random.randint(1600, 2400)
        habit_ratio = round(random.uniform(0.0, 0.4), 2)
        mood = random.choice([0, 1])  # Angry, Sad

    return [
        steps,
        random.choice([0, 1, 2, 3]),  # activity_type
        water,
        calories,
        round(random.uniform(40, 150), 1),   # protein
        round(random.uniform(150, 350), 1),  # carbs
        round(random.uniform(40, 120), 1),   # fat
        habit_ratio,
        mood,
        sleep_quality
    ]


for quality in [0, 1, 2]:
    for _ in range(ROWS_PER_CLASS):
        data.append(generate_row(quality))


columns = [
    "steps_count",
    "activity_type",
    "water_liters",
    "calories",
    "protein",
    "carbs",
    "fat",
    "habit_completion_ratio",
    "mood",
    "sleep_quality"
]

df = pd.DataFrame(data, columns=columns)
df.to_csv("sleep_dummy_data.csv", index=False)

print("Balanced sleep dataset created:", df["sleep_quality"].value_counts())
