from reddit_scraper import RedditScraper
import os
from dotenv import load_dotenv


def main():
    # Load environment variables
    load_dotenv()

    # Get Reddit API credentials from environment variables
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "F40_Research_Bot/1.0")

    if not all([client_id, client_secret]):
        print(
            "Error: Missing Reddit API credentials. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env file"
        )
        return


if __name__ == "__main__":
    main()
