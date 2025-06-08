import json
import pandas as pd
from datetime import datetime
import re
from tqdm import tqdm
import os


def parse_date(date_str):
    """Parse different date formats into datetime object"""
    # Try different date formats
    formats = [
        "%b %d, %Y at %I:%M %p",  # "Apr 10, 2013 at 10:38 PM"
        "%Y-%m-%dT%H:%M:%S",  # ISO format
        "%Y-%m-%dT%H:%M:%S.%f",  # ISO format with microseconds
        "%Y-%m-%d %H:%M:%S",  # "2024-03-15 14:30:00"
        "%b %d, %Y",  # "Apr 10, 2013"
        "%d %b %Y",  # "10 Apr 2013"
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    # If all formats fail, try to extract date components using regex
    try:
        # Match patterns like "Apr 10, 2013 at 10:38 PM"
        pattern = r"([A-Za-z]+)\s+(\d+),\s+(\d{4})(?:\s+at\s+(\d+):(\d+)\s+(AM|PM))?"
        match = re.match(pattern, date_str)
        if match:
            month, day, year = match.groups()[:3]
            hour, minute, ampm = match.groups()[3:6]

            # Convert month name to number
            month_num = datetime.strptime(month, "%b").month

            # Convert hour to 24-hour format if needed
            if hour and minute and ampm:
                hour = int(hour)
                if ampm == "PM" and hour != 12:
                    hour += 12
                elif ampm == "AM" and hour == 12:
                    hour = 0
                return datetime(int(year), month_num, int(day), hour, int(minute))
            else:
                return datetime(int(year), month_num, int(day))
    except:
        pass

    return None


def process_comments(
    input_file="unified_comments.json", output_file="standardized_comments.json"
):
    """Process comments and standardize dates"""
    print(f"Loading comments from {input_file}...")

    # Load comments
    with open(input_file, "r", encoding="utf-8") as f:
        comments = json.load(f)

    print(f"Processing {len(comments)} comments...")

    # Process each comment
    processed_comments = []
    for comment in tqdm(comments, desc="Standardizing dates"):
        processed_comment = comment.copy()

        if "created_at" in comment:
            parsed_date = parse_date(comment["created_at"])
            if parsed_date:
                # Store both original and standardized date
                processed_comment["original_date"] = comment["created_at"]
                processed_comment["created_at"] = parsed_date.isoformat()
            else:
                print(f"Warning: Could not parse date: {comment['created_at']}")

        processed_comments.append(processed_comment)

    # Save processed comments
    print(f"Saving standardized comments to {output_file}...")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(processed_comments, f, indent=2, ensure_ascii=False)

    # Print summary
    total_comments = len(processed_comments)
    dates_parsed = sum(1 for c in processed_comments if "original_date" in c)

    print("\nProcessing Summary:")
    print(f"Total comments processed: {total_comments}")
    print(f"Successfully parsed dates: {dates_parsed}")
    print(f"Failed to parse dates: {total_comments - dates_parsed}")


if __name__ == "__main__":
    process_comments()
