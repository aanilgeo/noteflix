from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile
from dotenv import load_dotenv
import google.generativeai as genai
import os

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


@app.get("/")
def root():
    return {"message": "NoteFlix backend running"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = """
    You are an AI study assistant for a web app called NoteFlix.

    From this image of lecture notes:
    1. Extract the text from the image.
    2. Summarize the notes in 5 clear bullet points.
    3. List the key concepts.
    4. Suggest 3 related topics the student should learn next.
    5. Suggest 3 YouTube search queries for learning this material.

    Return ONLY valid JSON. Do not include backticks or markdown formatting. 
    Do not add any explanation before or after the JSON.

    {
      "extracted_text": "...",
      "summary": ["...", "...", "..."],
      "key_concepts": ["...", "...", "..."],
      "related_topics": ["...", "...", "..."],
      "youtube_queries": ["...", "...", "..."]
    }
    """

    try:
        response = model.generate_content([
            prompt,
            {
                "mime_type": file.content_type,
                "data": contents
            }
        ])

        return {"result": response.text}

    except Exception as e:
        return {"error": str(e)}