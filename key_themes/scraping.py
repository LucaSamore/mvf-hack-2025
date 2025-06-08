import asyncio
import os
from crawl4ai import AsyncWebCrawler, LLMConfig
from web_search import search_website_for_car_model, read_prompt
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


async def scrape(url: str) -> str:
    try:
        async with AsyncWebCrawler() as crawler:
            llm_config = LLMConfig(
                provider="groq/llama-3.3-70b-versatile",
                api_token=os.getenv("GROQ_API_KEY"),
            )
            extraction_strategy = LLMExtractionStrategy(
                llm_config=llm_config,
                instruction=read_prompt("key_themes/prompts/scraping.md"),
            )
            result = await crawler.arun(
                url=url, extraction_strategy=extraction_strategy
            )
            print(result.markdown)
            return result.markdown
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""


def summarize_markdown(markdown_content: str) -> str:
    llm = Groq(api_key=os.getenv("GROQ_API_KEY"))
    chat_completion = llm.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": read_prompt("key_themes/prompts/summarization.md"),
            },
            {
                "role": "user",
                "content": markdown_content,
            },
        ],
    )
    summary = chat_completion.choices[0].message.content
    dump_markdown_to_file(summary, "ferrari_f40_summary.md")
    return summary


def dump_markdown_to_file(markdown_content: str, filename: str) -> None:
    try:
        with open(filename, "w", encoding="utf-8") as file:
            file.write(markdown_content)
    except Exception as e:
        print(f"Error writing to file {filename}: {e}")


if __name__ == "__main__":
    ws_result = search_website_for_car_model("Ferrari F40")
    for url in ws_result.urls:
        print(f"Scraping URL: {url}")
        markdown_content = asyncio.run(scrape(url))
        with open("ferrari_f40_review.md", "a", encoding="utf-8") as file:
            if markdown_content:
                file.write(markdown_content)
        summarize_markdown(markdown_content)
