from groq import Groq
from app.core.config import GROQ_API_KEY

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not set")

client = Groq(api_key=GROQ_API_KEY)


def generate_llm_recommendation(context_points: list[str]) -> dict:
    """
    Returns:
    {
        "summary": "short summary here",
        "action_items": ["item1", "item2", ...]
    }
    """
    prompt = f"""
You are a health AI assistant.

Based on the following insights:
{', '.join(context_points)}

Generate:
- One short friendly summary sentence (1-2 lines max)
- Then 3–5 concise bullet-point actionable health recommendations
- Respond in plain text only, without Markdown symbols or extra headings
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=250
    )

    text = response.choices[0].message.content.strip()
    lines = [line.strip("-* ").strip() for line in text.splitlines() if line.strip()]
    
    summary = lines[0] if lines else "No summary available"

    action_items = lines[1:6] 

    return {"summary": summary, "action_items": action_items}
