import asyncio
from crawl4ai import AsyncWebCrawler


async def main():
    # Create an instance of AsyncWebCrawler
    async with AsyncWebCrawler() as crawler:
        # Run the crawler on a URL
        result = await crawler.arun(
            url="https://www.caranddriver.com/reviews/a32983963/tested-1991-ferrari-f40/"
        )
        with open("ferrari_f40_review.txt", "w", encoding="utf-8") as file:
            # Write the extracted content to a markdown file
            file.write(result.text)
        # Print the extracted content
        print(result.text)


# Run the async main function
if __name__ == "__main__":
    asyncio.run(main())
