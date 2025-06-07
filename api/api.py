from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
from social_scraping.asp import (
    translate_to_ASPs,
    compute_engagements,
    read_scraped_data,
)

app = FastAPI(title="Social Media Engagement API", version="1.0.0")


@app.get("/")
def root():
    return {"message": "Social Media Engagement API"}


@app.get("/engagements")
def get_engagements():
    try:
        raw_data = read_scraped_data(
            "social_scraping/samples/dataset_tiktok_scraped.json"
        )

        if not raw_data:
            print("No raw data found.")
            return JSONResponse(content=[])

        posts = translate_to_ASPs(raw_data)

        engagements = compute_engagements(posts)

        engagement_data = [eng.model_dump_json() for eng in engagements]

        return JSONResponse(content=engagement_data)

    except Exception as e:
        print(f"Error processing engagements: {e}")
        return JSONResponse(content=[])


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

        with open("forum_scraping/samples/comments_with_sentiment.json", "r") as file:
            sentiment_data = json.load(file)

        if not sentiment_data:
            return JSONResponse(content=[])

        print(f"Total items available: {len(sentiment_data)}")

        # Apply pagination
        start_idx = offset
        end_idx = offset + limit
        paginated_data = sentiment_data[start_idx:end_idx]

        print(f"Processing items {start_idx} to {end_idx}")

        sentiment_mapping = {
            "positive": 1,
            "neutral": 0,
            "negative": -1,
        }

        mapped_data = []
        for i, item in enumerate(paginated_data):
            try:
                mapped_item = {
                    "sentiment": sentiment_mapping.get(
                        item.get("sentiment", {}).get("label", "neutral"), 0
                    ),
                    "created_at": item.get("created_at", ""),
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
