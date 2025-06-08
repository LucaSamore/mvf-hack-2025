import asyncio
from crawl4ai import AsyncWebCrawler
from web_search import search_website_for_car_model


async def scrape(url: str) -> str:
    try:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)
            print(result.markdown)
            return result.markdown
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""


if __name__ == "__main__":
    ws_result = search_website_for_car_model("Ferrari F40")
    for url in ws_result.urls:
        print(f"Scraping URL: {url}")
        markdown_content = asyncio.run(scrape(url))
        with open("ferrari_f40_review.md", "a", encoding="utf-8") as file:
            if markdown_content:
                file.write(markdown_content)
