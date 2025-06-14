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
def get_engagements(vehicle: str = None):
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
                },
                {
                    "engagement": 78,
                    "created_at": "2024-01-25T09:45:00Z",
                    "platform": "TikTok", 
                    "content": "BMW M3 performance test"
                },
                {
                    "engagement": 88,
                    "created_at": "2024-01-30T16:20:00Z",
                    "platform": "TikTok",
                    "content": "Lamborghini acceleration showcase"
                }
            ]

        if vehicle:
            if "ferrari" in vehicle.lower():
                raw_data = raw_data[:3]
            elif "bmw" in vehicle.lower():
                raw_data = raw_data[3:6]
            elif "lamborghini" in vehicle.lower():
                raw_data = raw_data[6:9]
            else:
                raw_data = raw_data[:2]
        else:
            raw_data = raw_data[:5]

        engagement_data = []
        for item in raw_data:
            play_count = item.get('playCount', 1)
            digg_count = item.get('diggCount', 0)
            comment_count = item.get('commentCount', 0)
            share_count = item.get('shareCount', 0)
            
            total_engagement = digg_count + comment_count + share_count
            engagement_rate = min(100, (total_engagement / play_count) * 100) if play_count > 0 else 0
            
            engagement_item = {
                "engagement": round(engagement_rate, 1),
                "created_at": item.get("createTimeISO", datetime.now().isoformat()),
                "platform": "TikTok",
                "content": f"TikTok video with {play_count:,} views and {total_engagement:,} interactions"
            }
            engagement_data.append(engagement_item)

        return JSONResponse(content={"data": engagement_data})

    except Exception as e:
        print(f"Error processing engagements: {e}")
        return JSONResponse(content={"data": []})


@app.get("/sentiments")
def get_sentiments(vehicle: str = None, limit: int = 1000, offset: int = 0):
    """
    Get sentiment data with pagination and vehicle filtering.

    Args:
        vehicle: Vehicle name/brand to filter by
        limit: Number of items to return (max 1000)
        offset: Number of items to skip from the beginning
    """
    try:
        # Limit the maximum number of items to prevent memory issues
        limit = min(limit, 1000)

        print(f"Loading sentiment data with vehicle={vehicle}, limit={limit}, offset={offset}")

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
                    "sentiment": 0.5,
                    "sentiment_score": 0.5,
                    "created_at": "2024-01-15T10:30:00Z",
                    "comment": "Good performance overall"
                },
                {
                    "sentiment": 0.3,
                    "sentiment_score": 0.3,
                    "created_at": "2024-01-20T14:15:00Z",
                    "comment": "Decent build quality"
                },
                {
                    "sentiment": -0.1,
                    "sentiment_score": 0.1,
                    "created_at": "2024-01-25T09:45:00Z",
                    "comment": "Could be better value for money"
                }
            ]

        if vehicle:
            if "ferrari" in vehicle.lower():
                sentiment_data = [
                    {
                        "sentiment": 0.8,
                        "sentiment_score": 0.8,
                        "created_at": "2024-01-15T10:30:00Z",
                        "comment": "Ferrari has incredible performance and handling"
                    },
                    {
                        "sentiment": 0.6,
                        "sentiment_score": 0.6,
                        "created_at": "2024-01-20T14:15:00Z",
                        "comment": "Love the Ferrari design and aesthetics"
                    },
                    {
                        "sentiment": -0.2,
                        "sentiment_score": 0.2,
                        "created_at": "2024-01-25T09:45:00Z",
                        "comment": "Ferrari maintenance costs are quite high"
                    }
                ]
            elif "bmw" in vehicle.lower():
                sentiment_data = [
                    {
                        "sentiment": 0.7,
                        "sentiment_score": 0.7,
                        "created_at": "2024-01-15T10:30:00Z",
                        "comment": "BMW M3 has excellent driving dynamics"
                    },
                    {
                        "sentiment": 0.5,
                        "sentiment_score": 0.5,
                        "created_at": "2024-01-20T14:15:00Z",
                        "comment": "BMW interior quality is impressive"
                    },
                    {
                        "sentiment": -0.1,
                        "sentiment_score": 0.1,
                        "created_at": "2024-01-25T09:45:00Z",
                        "comment": "BMW can be expensive to maintain"
                    }
                ]
            elif "lamborghini" in vehicle.lower():
                sentiment_data = [
                    {
                        "sentiment": 0.9,
                        "sentiment_score": 0.9,
                        "created_at": "2024-01-15T10:30:00Z",
                        "comment": "Lamborghini acceleration is absolutely insane"
                    },
                    {
                        "sentiment": 0.8,
                        "sentiment_score": 0.8,
                        "created_at": "2024-01-20T14:15:00Z",
                        "comment": "Lamborghini design is stunning and aggressive"
                    },
                    {
                        "sentiment": -0.4,
                        "sentiment_score": 0.4,
                        "created_at": "2024-01-25T09:45:00Z",
                        "comment": "Lamborghini is very expensive and impractical"
                    }
                ]
            else:
                sentiment_data = sentiment_data[:25]
        else:
            sentiment_data = sentiment_data[:100]

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
                "vehicle_filter": vehicle,
            },
        }

        return JSONResponse(content=response_data)

    except Exception as e:
        print(f"Error processing sentiments: {e}")
        import traceback

        traceback.print_exc()
        return JSONResponse(content={"data": [], "error": str(e)})

@app.post("/api/chat")
async def chat_endpoint(request: dict):
    try:
        question = request.get("question", "")
        context = request.get("context", [])
        
        from groq import Groq
        import os
        
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        system_prompt = """You are an AI assistant specializing in automotive sentiment analysis. You can answer general questions creatively and helpfully, but always guide the conversation back to sentiment analysis and automotive insights.

When answering general questions:
1. Provide a helpful, creative response
2. Then smoothly transition to how this relates to sentiment analysis or automotive insights
3. Encourage the user to explore the sentiment data and reports

Keep responses concise but engaging. Always maintain focus on the sentiment analysis context."""
        
        user_prompt = f"Question: {question}\n\nContext from sentiment analysis: {context}\n\nPlease answer the question and guide the conversation toward sentiment analysis topics."
        
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        response = chat_completion.choices[0].message.content
        return {"response": response}
        
    except Exception as e:
        print(f"Chat API error: {e}")
        return {"response": "I'm having trouble right now. Please try asking about specific sentiment insights or explore the vehicle data in the report."}
