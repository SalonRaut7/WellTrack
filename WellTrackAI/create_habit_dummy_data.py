import pandas as pd
import random

random.seed(42)
ROWS_PER_CLASS = 500  # To make balanced dataset
data = []

# Generate successes (habit_success = 1)
for _ in range(ROWS_PER_CLASS):
    previous_habit_ratio = round(random.uniform(0.7, 1), 2)  # high ratio
    sleep_hours = round(random.uniform(6, 9), 1)
    sleep_quality = random.choice([1,2])
    water_liters = round(random.uniform(2,4),1)
    steps_count = random.randint(6000,12000)
    calories = random.randint(2000,3200)
    protein = round(random.uniform(60,150),1)
    carbs = round(random.uniform(200,400),1)
    fat = round(random.uniform(50,120),1)
    mood = random.randint(3,4)  # relaxed or happy
    habit_success = 1
    data.append([
        previous_habit_ratio, sleep_hours, sleep_quality, water_liters, steps_count,
        calories, protein, carbs, fat, mood, habit_success
    ])

# Generate failures (habit_success = 0)
for _ in range(ROWS_PER_CLASS):
    previous_habit_ratio = round(random.uniform(0, 0.6), 2)  # low ratio
    sleep_hours = round(random.uniform(3, 7), 1)
    sleep_quality = random.choice([0,1])
    water_liters = round(random.uniform(0.5,2.5),1)
    steps_count = random.randint(1000,8000)
    calories = random.randint(1800,2800)
    protein = round(random.uniform(40,100),1)
    carbs = round(random.uniform(150,300),1)
    fat = round(random.uniform(40,90),1)
    mood = random.randint(0,2)  # angry, sad, neutral
    habit_success = 0
    data.append([
        previous_habit_ratio, sleep_hours, sleep_quality, water_liters, steps_count,
        calories, protein, carbs, fat, mood, habit_success
    ])

columns = [
    "previous_habit_ratio", "sleep_hours", "sleep_quality", "water_liters",
    "steps_count", "calories", "protein", "carbs", "fat", "mood", "habit_success"
]

df = pd.DataFrame(data, columns=columns)
df.to_csv("data/habit_dummy_data.csv", index=False)
print("Balanced habit dataset created with shape:", df.shape)
print("Habit success distribution:\n", df["habit_success"].value_counts())
