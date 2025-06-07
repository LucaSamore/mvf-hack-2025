import praw
import json
from datetime import datetime
import time


class RedditScraper:
    def __init__(self, client_id, client_secret, user_agent):
        """Initialize the Reddit scraper with API credentials"""
        self.reddit = praw.Reddit(
            client_id=client_id, client_secret=client_secret, user_agent=user_agent
        )

    def search_posts(self, query="f40", limit=1000000):
        """Search for posts containing the query"""
        print(f"Searching for posts containing '{query}'...")
        subreddits = {}  # Dictionary to store subreddits and their posts

        # Define relevant terms
        relevant_terms = ["ferrari"]

        try:
            # Search for posts
            search_results = self.reddit.subreddit("all").search(
                query, sort="relevance", limit=limit
            )
            for submission in search_results:
                # Get subreddit info
                subreddit = submission.subreddit
                subreddit_name = subreddit.display_name

                # Check if subreddit or post content is relevant
                title_lower = subreddit.title.lower()
                desc_lower = subreddit.public_description.lower()

                # Exclude posts if 'bmw' is found in subreddit or post content
                if "bmw" in title_lower or "bmw" in desc_lower:
                    print(
                        f"Excluding post from r/{subreddit_name}: {submission.title[:50]}... (contains 'bmw')"
                    )
                    continue

                # Check if any relevant term is in subreddit info or post content
                is_relevant = any(
                    term in title_lower or term in desc_lower for term in relevant_terms
                ) or any(
                    term in post_title_lower or term in post_text_lower
                    for term in relevant_terms
                )

                if is_relevant:
                    # Initialize subreddit data if not exists
                    if subreddit_name not in subreddits:
                        subreddits[subreddit_name] = {
                            "name": subreddit_name,
                            "title": subreddit.title,
                            "description": subreddit.public_description,
                            "subscribers": subreddit.subscribers,
                            "created_utc": datetime.fromtimestamp(
                                subreddit.created_utc
                            ).isoformat(),
                            "url": f"https://www.reddit.com/r/{subreddit_name}",
                            "posts": [],
                        }

                    # Fetch comments
                    submission.comments.replace_more(
                        limit=0
                    )  # Remove MoreComments objects
                    comments = []
                    for comment in submission.comments.list():
                        comments.append(
                            {
                                "id": comment.id,
                                "author": str(comment.author),
                                "body": comment.body,
                                "score": comment.score,
                                "created_utc": datetime.fromtimestamp(
                                    comment.created_utc
                                ).isoformat(),
                                "is_submitter": comment.is_submitter,
                            }
                        )

                    # Add post data with full content
                    post_data = {
                        "id": submission.id,
                        "title": submission.title,
                        "author": str(submission.author),
                        "created_utc": datetime.fromtimestamp(
                            submission.created_utc
                        ).isoformat(),
                        "score": submission.score,
                        "upvote_ratio": submission.upvote_ratio,
                        "num_comments": submission.num_comments,
                        "url": f"https://www.reddit.com{submission.permalink}",
                        "selftext": submission.selftext,
                        "is_original_content": submission.is_original_content,
                        "link_flair_text": submission.link_flair_text,
                        "comments": comments,
                        "full_content": {
                            "title": submission.title,
                            "text": submission.selftext,
                            "url": submission.url
                            if hasattr(submission, "url")
                            else None,
                            "is_self": submission.is_self,
                            "media": submission.media
                            if hasattr(submission, "media")
                            else None,
                        },
                    }

                    subreddits[subreddit_name]["posts"].append(post_data)
                    print(
                        f"Found post in r/{subreddit_name}: {submission.title[:50]}... ({len(comments)} comments)"
                    )
                else:
                    print(
                        f"Skipping post from r/{subreddit_name}: {submission.title[:50]}... (no relevant terms found)"
                    )

            # Convert dictionary to list
            subreddits_list = list(subreddits.values())
            print(f"\nSummary:")
            print(f"Found {len(subreddits_list)} relevant subreddits")
            total_posts = sum(len(s["posts"]) for s in subreddits_list)
            total_comments = sum(
                sum(len(p["comments"]) for p in s["posts"]) for s in subreddits_list
            )
            print(f"Total posts collected: {total_posts}")
            print(f"Total comments collected: {total_comments}")
            return subreddits_list

        except Exception as e:
            print(f"Error searching posts: {str(e)}")
            return []

    def scrape_search_results(self, query="f40", output_file="reddit_data.json"):
        """Main method to scrape posts and organize them by subreddit"""
        # Search for posts
        subreddits = self.search_posts(query)

        # Save results to JSON
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(subreddits, f, indent=2, ensure_ascii=False)

        print(f"Finished! Data saved to {output_file}")
        return subreddits
