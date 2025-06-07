from fastapi import FastAPI
from fastapi.responses import JSONResponse
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
