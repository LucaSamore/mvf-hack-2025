import requests
from bs4 import BeautifulSoup
import time
import json
from datetime import datetime
import re
import os
from dotenv import load_dotenv

from ferrarichat_scraper import FerrariChatScraper
from reddit_scraper import RedditScraper


def main():
    # Load environment variables for Reddit API
    load_dotenv()
    
   # Initialize Reddit scraper
    client_id = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    user_agent = os.getenv('REDDIT_USER_AGENT', 'ferrari/1.0')
    
    if all([client_id, client_secret]):
        print("\n=== Scraping Reddit ===")
        reddit_scraper = RedditScraper(client_id, client_secret, user_agent)
      #  reddit_results = reddit_scraper.scrape_search_results(query='f40')
    else:
        print("\nSkipping Reddit scraping: Missing API credentials in .env file")
        print("Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env file")

    # Initialize FerrariChat scraper
    ferrari_scraper = FerrariChatScraper()
    
    # Search URL for FerrariChat
    search_url = "https://www.ferrarichat.com/forum/search/530822666/?q=f40&o=relevance"
    
    # Run FerrariChat scraper
    print("\n=== Scraping FerrariChat ===")
    ferrari_results = ferrari_scraper.scrape_search_results(search_url)

    print("\nScraping completed!")


if __name__ == "__main__":
    main()