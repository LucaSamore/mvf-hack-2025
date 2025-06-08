from pydantic import BaseModel
from typing import List
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()


class WebSearchResult(BaseModel):
    urls: List[str]


def search_website_for_car_model(car_model: str) -> WebSearchResult:
    llm = Groq(api_key=os.getenv("GROQ_API_KEY"))
    chat_completion = llm.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": read_prompt("key_themes/prompts/web_search.md"),
            },
            {
                "role": "user",
                "content": f"Search for websites related to the car model: {car_model}",
            },
        ],
    )
    raw_json = chat_completion.choices[0].message.content
    return WebSearchResult.model_validate_json(raw_json)


def read_prompt(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        print(f"Error reading prompt file: {e}")
        return ""


if __name__ == "__main__":
    car_model = "Ferrari F40"
    search_result = search_website_for_car_model(car_model)
    print(f"Search results for {car_model}:")
    for url in search_result.urls:
        print(url)
