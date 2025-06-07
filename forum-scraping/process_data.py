import json
from datetime import datetime
import os

def process_reddit_data(reddit_data):
    """Process Reddit data and extract comments with dates"""
    comments = []
    
    for subreddit in reddit_data:
        for post in subreddit['posts']:
            # Add post content as a comment
            if post['selftext']:
                comments.append({
                    'created_at': post['created_utc'],
                    'comment': post['selftext'],
                })
            
            # Add all comments
            for comment in post['comments']:
                comments.append({
                    'created_at': comment['created_utc'],
                    'comment': comment['body'],
                })
    
    return comments

def process_ferrarichat_data(ferrari_data):
    """Process FerrariChat data and extract comments with dates"""
    comments = []
    
    for thread in ferrari_data:
        for post in thread['posts']:
            comments.append({
                'created_at': post['timestamp'],
                'comment': post['content'],
            })
    
    return comments

def main():
    # Input files
    reddit_file = 'reddit_data.json'
    ferrari_file = 'ferrarichat_data.json'
    
    all_comments = []
    
    # Process Reddit data if file exists
    if os.path.exists(reddit_file):
        print(f"Processing {reddit_file}...")
        with open(reddit_file, 'r', encoding='utf-8') as f:
            reddit_data = json.load(f)
            all_comments.extend(process_reddit_data(reddit_data))
    
    # Process FerrariChat data if file exists
    if os.path.exists(ferrari_file):
        print(f"Processing {ferrari_file}...")
        with open(ferrari_file, 'r', encoding='utf-8') as f:
            ferrari_data = json.load(f)
            all_comments.extend(process_ferrarichat_data(ferrari_data))
    
    # Sort comments by date
    all_comments.sort(key=lambda x: x['created_at'])
    
    # Write output
    output_file = 'unified_comments.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_comments, f, indent=2, ensure_ascii=False)
    
    print(f"\nProcessed {len(all_comments)} comments")
    print(f"Output saved to {output_file}")

if __name__ == "__main__":
    main() 