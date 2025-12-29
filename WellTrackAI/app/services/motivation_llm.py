from groq import Groq
from app.core.config import GROQ_API_KEY
from datetime import date

client = Groq(api_key=GROQ_API_KEY)


def generate_daily_motivation(for_date: date) -> str:
    """
    Generates a short daily motivational message.
    """

    prompt = f"""
You are a friendly health and wellness coach.

Generate ONE short daily motivational message for the date {for_date}.
Rules:
- 1 or 2 sentences only
- Positive, encouraging, and human-like
- No emojis overload (max 1 emoji)
- No bullet points
- No quotes
- No markdown

Example tone:
"Small steps today lead to big wins tomorrow. Stay consistent 💪"
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6,
        max_tokens=80
    )

    return response.choices[0].message.content.strip()
