from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from groq import Groq
import json
import os

load_dotenv()

ASP_PROMPT_PATH = "social-scraping/prompts/asp_translation.md"


class AbstractSocialPost(BaseModel):
    """
    Abstract base class for social media posts.
    """

    date: str
    views: int
    likes: int
    shares: int
    comments: int


def translate_to_ASPs(raw_data: str) -> List[AbstractSocialPost]:
    llm = Groq(api_key=os.getenv("GROQ_API_KEY"))
    chat_completion = llm.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": _read_prompt()},
            {"role": "user", "content": raw_data},
        ],
    )
    raw_json = chat_completion.choices[0].message.content
    print(f"Raw JSON from LLM: {raw_json}")
    posts_data = json.loads(raw_json)
    return [AbstractSocialPost.model_validate(post_data) for post_data in posts_data]


def compute_engagement_for_post(post: AbstractSocialPost) -> float:
    return (post.likes + 3.0 * post.shares + 0.5 * post.comments) / post.views + 1


def compute_engagements(posts: List[AbstractSocialPost]) -> List[float]:
    return [compute_engagement_for_post(post) for post in posts]


def _read_prompt() -> str:
    try:
        with open(ASP_PROMPT_PATH, "r") as file:
            return file.read()
    except Exception as e:
        print(f"Error reading prompt file: {e}")
        return ""


def _read_scraped_data(file_path: str) -> str:
    try:
        with open(file_path, "r") as file:
            return file.read()
    except Exception as e:
        print(f"Error reading raw data file: {e}")
        return ""


if __name__ == "__main__":
    try:
        raw_data = _read_scraped_data("social-scraping/samples/dataset_tiktok_scraped.json")
        translated_posts = translate_to_ASPs(raw_data)
        print(translated_posts)
        print("Engagements:", compute_engagements(translated_posts))
    except Exception as e:
        print(f"Error in main execution: {e}")
