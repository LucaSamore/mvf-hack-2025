from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import os
from datetime import datetime

app = FastAPI(title="Social Media Engagement API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Social Media Engagement API"}


@app.get("/engagements")
def get_engagements():
    try:
        tiktok_file = "social_scraping/samples/dataset_tiktok_scraped.json"
        if os.path.exists(tiktok_file):
            with open(tiktok_file, "r") as file:
                raw_data = json.load(file)
        else:
            raw_data = [
                {
                    "engagement": 85,
                    "created_at": "2024-01-15T10:30:00Z",
                    "platform": "TikTok",
                    "content": "Ferrari review video"
                },
                {
                    "engagement": 92,
                    "created_at": "2024-01-20T14:15:00Z", 
                    "platform": "TikTok",
                    "content": "Car comparison content"
                }
            ]

        engagement_data = []
        for item in raw_data:
            engagement_item = {
                "engagement": item.get("engagement", 75),
                "created_at": item.get("created_at", datetime.now().isoformat()),
                "platform": item.get("platform", "TikTok"),
                "content": item.get("content", "Social media content")
            }
            engagement_data.append(engagement_item)

        return JSONResponse(content={"data": engagement_data})

    except Exception as e:
        print(f"Error processing engagements: {e}")
        return JSONResponse(content={"data": []})


@app.get("/sentiments")
def get_sentiments(limit: int = 1000, offset: int = 0):
    """
    Get sentiment data with pagination to handle large files.

    Args:
        limit: Number of items to return (max 1000)
        offset: Number of items to skip from the beginning
    """
    try:
        # Limit the maximum number of items to prevent memory issues
        limit = min(limit, 1000)

        print(f"Loading sentiment data with limit={limit}, offset={offset}")

        data_files = [
            "forum_scraping/v1/standardized_comments.json",
            "forum_scraping/v1/sentiment_analysis_results.json",
            "forum_scraping/v1/ferrarichat_data.json",
            "forum_scraping/v2/reddit_data.json"
        ]
        
        sentiment_data = []
        for file_path in data_files:
            if os.path.exists(file_path):
                with open(file_path, "r") as file:
                    file_data = json.load(file)
                    if isinstance(file_data, list):
                        sentiment_data.extend(file_data)
                    else:
                        sentiment_data.append(file_data)
                break

        if not sentiment_data:
            sentiment_data = [
                {
                    "sentiment": 0.8,
                    "sentiment_score": 0.8,
                    "created_at": "2024-01-15T10:30:00Z",
                    "comment": "Great performance and handling"
                },
                {
                    "sentiment": -0.3,
                    "sentiment_score": -0.3,
                    "created_at": "2024-01-20T14:15:00Z",
                    "comment": "Too expensive for maintenance"
                },
                {
                    "sentiment": 0.6,
                    "sentiment_score": 0.6,
                    "created_at": "2024-01-25T09:45:00Z",
                    "comment": "Beautiful design and aesthetics"
                }
            ]

        print(f"Total items available: {len(sentiment_data)}")

        # Apply pagination
        start_idx = offset
        end_idx = offset + limit
        paginated_data = sentiment_data[start_idx:end_idx]

        print(f"Processing items {start_idx} to {end_idx}")

        mapped_data = []
        for i, item in enumerate(paginated_data):
            try:
                if isinstance(item.get("sentiment"), dict):
                    sentiment_score = item["sentiment"]["score"]
                    sentiment_label = item["sentiment"]["label"]
                    sentiment_value = 1 if sentiment_label == "positive" else (-1 if sentiment_label == "negative" else 0)
                elif isinstance(item.get("sentiment"), (int, float)):
                    sentiment_value = item["sentiment"]
                    sentiment_score = abs(item["sentiment"])
                else:
                    sentiment_value = 0
                    sentiment_score = 0.5
                
                mapped_item = {
                    "sentiment": sentiment_value,
                    "sentiment_score": sentiment_score,
                    "created_at": item.get("created_at", ""),
                    "comment": item.get("comment", ""),
                }
                mapped_data.append(mapped_item)
            except Exception as item_error:
                print(f"Error processing item {start_idx + i}: {item_error}")
                continue

        print(f"Successfully processed {len(mapped_data)} items")

        # Add metadata about pagination
        response_data = {
            "data": mapped_data,
            "metadata": {
                "total_items": len(sentiment_data),
                "returned_items": len(mapped_data),
                "limit": limit,
                "offset": offset,
                "has_more": end_idx < len(sentiment_data),
            },
        }

        return JSONResponse(content=response_data)

    except Exception as e:
        print(f"Error processing sentiments: {e}")
        import traceback

        traceback.print_exc()
        return JSONResponse(content={"data": [], "error": str(e)})
