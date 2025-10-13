# ==============================================================================
# PsyDesign AI: Main FastAPI Application
#
# Author: AIONEX AI TEAM
# Description: This file serves as the main entry point for the PsyDesign AI
#              web application. It handles brand identity generation using
#              OpenAI's GPT-4o and DALL-E 3, provides a chat interface,
#              manages a design history database, and serves the frontend.
# ==============================================================================


# --- Core Imports ---
import os
import json
import uvicorn
import httpx
from typing import List

# --- Framework and Library Imports ---
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from openai import AsyncOpenAI
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func


# ==============================================================================
# SECTION 1: CORE CONFIGURATION & CLIENTS
# ==============================================================================

# --- OpenAI API Configuration ---
# NOTE: It is strongly recommended to use environment variables for API keys
#       in a production environment for security reasons.
#       Example: API_KEY = os.getenv("OPENAI_API_KEY")
API_KEY = "YOUR_OPENAI_API_KEY_HERE" # Replace with your actual key
if not API_KEY or API_KEY == "API_KEY_HERE":
    print("WARNING: OpenAI API key is not set. Please replace 'YOUR_OPENAI_API_KEY_HERE'.")
    # You might want to exit or handle this more gracefully
    # exit()

# Initialize the asynchronous OpenAI client
client = AsyncOpenAI(api_key=API_KEY)


# ==============================================================================
# SECTION 2: DATABASE SETUP (SQLAlchemy)
# ==============================================================================

# --- Database Connection ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./brand_history.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # `check_same_thread` is required for SQLite to allow multithreading,
    # which is necessary for FastAPI's asynchronous operations.
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Model ---
class History(Base):
    """
    Represents a single brand design record in the database.
    """
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True, comment="The user's initial brand description.")
    analysis = Column(Text, comment="The full JSON response from GPT-4o containing the brand analysis.")
    logo_url = Column(String, comment="The URL of the DALL-E 3 generated logo.")
    language = Column(String, comment="The language code used for the generation (e.g., 'en', 'es').")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="Timestamp of record creation.")

    def to_dict(self):
        """Converts the SQLAlchemy model instance to a dictionary."""
        return {
            "id": self.id,
            "description": self.description,
            "analysis": self.analysis,
            "logo_url": self.logo_url,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# Create the database tables if they don't exist
Base.metadata.create_all(bind=engine)

# --- Database Dependency ---
def get_db():
    """
    FastAPI dependency that provides a database session for each request.
    It ensures the session is always closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================================================================
# SECTION 3: INTERNATIONALIZATION (i18n)
# ==============================================================================

# Holds the UI translations for the frontend templates.
translations = {
    "en": {"title": "PsyDesign AI - Brand Psychology Designer", "header_title": "PsyDesign AI", "header_subtitle": "Your brand's soul, designed by intelligence.", "input_placeholder": "e.g., 'A sustainable coffee brand for urban youth.'", "design_button": "Design My Brand", "history_title": "Design History", "new_design": "New Design"},
    "es": {"title": "PsyDesign AI - Diseñador de Psicología de Marca", "header_title": "PsyDesign AI", "header_subtitle": "El alma de tu marca, diseñada por inteligencia.", "input_placeholder": "Ej: 'Una marca de café sostenible para jóvenes urbanos.'", "design_button": "Diseñar Mi Marca", "history_title": "Historial de Diseños", "new_design": "Nuevo Diseño"},
    "fr": {"title": "PsyDesign AI - Concepteur en Psychologie de Marque", "header_title": "PsyDesign AI", "header_subtitle": "L'âme de votre marque, conçue par l'intelligence.", "input_placeholder": "Ex: 'Une marque de café durable pour les jeunes urbains.'", "design_button": "Concevoir Ma Marque", "history_title": "Historique des Conceptions", "new_design": "Nouveau Design"},
    "hi": {"title": "साइ-डिज़ाइन AI - ब्रांड मनोविज्ञान डिज़ाइनर", "header_title": "साइ-डिज़ाइन AI", "header_subtitle": "आपकी ब्रांड की आत्मा, बुद्धिमत्ता द्वारा डिज़ाइन की गई।", "input_placeholder": "उदा: 'शहरी युवाओं के लिए एक सस्टेनेबल कॉफ़ी ब्रांड।'", "design_button": "मेरा ब्रांड डिज़ाइन करें", "history_title": "डिज़ाइन इतिहास", "new_design": "नया डिज़ाइन"},
    "zh": {"title": "PsyDesign AI - 品牌心理学设计师", "header_title": "PsyDesign AI", "header_subtitle": "智能设计的品牌灵魂。", "input_placeholder": "例如：'一个为城市青年打造的可持续咖啡品牌。'", "design_button": "设计我的品牌", "history_title": "设计历史", "new_design": "新设计"},
    "ar": {"title": "PsyDesign AI - مصمم سيكولوجية العلامة التجارية", "header_title": "PsyDesign AI", "header_subtitle": "روح علامتك التجارية، مصممة بالذكاء.", "input_placeholder": "مثال: 'علامة تجارية مستدامة للقهوة لشباب المدن.'", "design_button": "صمم علامتي التجارية", "history_title": "سجل التصميمات", "new_design": "تصميم جديد"}
}


# ==============================================================================
# SECTION 4: FASTAPI APPLICATION SETUP
# ==============================================================================

app = FastAPI(title="PsyDesign AI")

# --- Static Files and Templates ---
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# --- Pydantic Models for Request Validation ---
class BrandRequest(BaseModel):
    """Defines the expected data structure for a new brand generation request."""
    description: str
    language: str = 'en'

class ChatRequest(BaseModel):
    """Defines the structure for a chat message request with the brand persona."""
    analysis: str  # The full JSON analysis string
    message: str
    language: str = 'en'
    
class TTSRequest(BaseModel):
    """Defines the structure for a text-to-speech request."""
    text: str


# --- Prompt Engineering Functions ---
def create_innovative_prompt(description: str, language: str) -> str:
    """
    Constructs a detailed, structured prompt for GPT-4o to generate a
    comprehensive brand identity report in a specific language.

    Args:
        description: The user's input describing the brand concept.
        language: The target language code for the output.

    Returns:
        A formatted string prompt for the OpenAI API.
    """
    language_map = {
        'en': 'English', 'es': 'Spanish', 'fr': 'French',
        'hi': 'Hindi', 'zh': 'Mandarin Chinese', 'ar': 'Arabic'
    }
    output_language = language_map.get(language, 'English')
    
    # This structured prompt is crucial for forcing the model to return
    # a predictable JSON object, which is easier and safer to parse.
    return f"""
    **Task**: Generate a comprehensive "Brand Psychology Identity Report" in {output_language}.
    **Brand Concept**: "{description}"

    **Instructions**:
    Provide the output in a structured JSON format. The JSON object must have these exact keys: "brand_personality", "visual_identity", "brand_names", "slogans", "brand_story", "social_media_bio", "target_audience_persona", "marketing_campaign_idea", "logo_concept_description".
    - For "font_pairing", provide real, popular font names from Google Fonts (e.g., "Poppins", "Lato", "Montserrat").
    - "brand_story" must be a short, compelling narrative (2-3 sentences).
    - Each section must be detailed, insightful, and written natively in {output_language}.

    **JSON Structure**:
    {{
      "brand_personality": {{"archetype": "...", "tone_of_voice": "...", "values": ["...", "..."]}},
      "visual_identity": {{
        "font_pairing": {{
          "heading": {{"name": "Name from Google Fonts", "style": "Bold"}}, 
          "body": {{"name": "Name from Google Fonts", "style": "Regular"}}
        }}
      }},
      "brand_names": ["...", "...", "..."],
      "slogans": ["...", "...", "..."],
      "brand_story": "...",
      "social_media_bio": "...",
      "target_audience_persona": {{"name": "...", "age_range": "...", "occupation": "...", "interests": ["...", "..."], "pain_points": ["...", "..."]}},
      "marketing_campaign_idea": {{"title": "...", "concept": "..."}},
      "logo_concept_description": "A very detailed, visual description for a logo concept that is minimalist, iconic, and memorable."
    }}
    """


# ==============================================================================
# SECTION 5: API ENDPOINTS
# ==============================================================================

# --- Frontend Routes ---
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request, lang: str = 'en'):
    """Serves the main dashboard page."""
    # Default to English if an unsupported language code is provided
    if lang not in translations:
        lang = 'en'
    
    context = {
        "request": request,
        "lang": lang,
        "t": translations[lang] # Pass the translation dictionary to the template
    }
    return templates.TemplateResponse("dashboard.html", context)


# --- Core API Routes ---

@app.post("/api/generate-brand", status_code=201)
async def generate_brand_identity(request: BrandRequest, db: Session = Depends(get_db)):
    """
    Main endpoint to generate a full brand identity.
    It orchestrates calls to GPT-4o for analysis and DALL-E 3 for a logo,
    then saves the result to the database.
    """
    try:
        # 1. Generate the brand analysis using GPT-4o
        prompt_text = create_innovative_prompt(request.description, request.language)
        
        gpt_response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are PsyDesign AI, an expert in brand psychology. You always respond with a valid JSON object based on the user's requested structure."},
                {"role": "user", "content": prompt_text}
            ],
            response_format={"type": "json_object"}
        )
        
        analysis_result_json = gpt_response.choices[0].message.content
        analysis_data = json.loads(analysis_result_json)
        
        # 2. Generate the logo using DALL-E 3
        logo_concept = analysis_data.get("logo_concept_description", f"A minimalist logo for: {request.description}")
        logo_prompt = (
            f"Generate a single, ultra-minimalist, iconic logo design representing: '{logo_concept}'. "
            f"Style: Flat vector, single object or symbol, clean lines, highly memorable, and versatile. "
            f"Background: Solid, clean, neutral white background. No text, no shadows, no complex gradients. The logo must be centered."
        )
        
        dalle_response = await client.images.generate(
            model="dall-e-3",
            prompt=logo_prompt,
            n=1,
            size="1024x1024",
            quality="hd"
        )
        logo_url = dalle_response.data[0].url

        # 3. Save the results to the database
        db_history = History(
            description=request.description,
            analysis=analysis_result_json,
            logo_url=logo_url,
            language=request.language
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)

        return JSONResponse(
            content={"id": db_history.id, "analysis": analysis_data, "logo_url": logo_url},
            status_code=201
        )

    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse JSON from GPT in /api/generate-brand: {e}")
        raise HTTPException(status_code=500, detail="Failed to process the AI's response format.")
    except Exception as e:
        print(f"ERROR: An unexpected error occurred in /api/generate-brand: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate brand identity. Please check server logs and API key.")


@app.post("/api/chat-with-persona")
async def chat_with_persona(request: ChatRequest):
    """
    Handles chat interactions with the generated brand persona.
    It uses a system prompt to constrain the AI's responses to be in character.
    """
    try:
        analysis_data = json.loads(request.analysis)
        persona_description = analysis_data.get("brand_personality", {})
        tone_of_voice = persona_description.get("tone_of_voice", "friendly")

        language_map = {'en': 'English', 'es': 'Spanish', 'fr': 'French', 'hi': 'Hindi', 'zh': 'Mandarin Chinese', 'ar': 'Arabic'}
        output_language = language_map.get(request.language, 'English')

        system_prompt = f"""
        You are the persona of a brand. Your tone of voice is strictly: "{tone_of_voice}".
        Your ONLY purpose is to answer questions about the brand identity, marketing, and target audience.
        
        **Strict Rule**: You are FORBIDDEN from answering any questions unrelated to this brand.
        If asked about off-topic subjects (like news, politics, personal advice, etc.), you MUST politely decline.
        Example refusal: "I'm sorry, my expertise is limited to our brand's world. I can't help with that, but I can tell you more about our marketing ideas!"
        
        You must respond in {output_language}. Keep your answers concise and in character.
        """
        
        gpt_response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ]
        )
        chat_reply = gpt_response.choices[0].message.content
        return JSONResponse(content={"reply": chat_reply})

    except Exception as e:
        print(f"ERROR: An error occurred in /api/chat-with-persona: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a response from the persona.")


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """
    Converts a given text string into speech audio using OpenAI's TTS model.
    Streams the audio back to the client.
    """
    try:
        response = await client.audio.speech.create(
            model="tts-1-hd",  # Using the high-definition model
            voice="nova",      # A pleasant, clear voice
            input=request.text
        )
        return StreamingResponse(response.iter_bytes(), media_type="audio/mpeg")
    except Exception as e:
        print(f"ERROR: An error occurred in /api/tts: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio.")


@app.get("/api/proxy-image")
async def proxy_image(url: str):
    """
    Acts as a server-side proxy to fetch an image from a URL.
    This is essential for allowing the frontend to download images from
    external URLs (like OpenAI's) without running into CORS issues.
    """
    async with httpx.AsyncClient() as async_client:
        try:
            response = await async_client.get(url, timeout=30.0)
            response.raise_for_status() # Raise an exception for 4xx or 5xx status codes
            
            content_type = response.headers.get('content-type', 'application/octet-stream')
            return StreamingResponse(response.iter_bytes(), media_type=content_type)
            
        except httpx.RequestError as e:
            print(f"ERROR: Request failed while proxying image: {e}")
            raise HTTPException(status_code=502, detail="Failed to fetch the image from the source.")
        except Exception as e:
            print(f"ERROR: An unexpected error occurred in image proxy: {e}")
            raise HTTPException(status_code=500, detail="An internal server error occurred while fetching the image.")


# --- History Management Routes ---

@app.get("/api/history", response_model=List[dict])
async def get_history(db: Session = Depends(get_db)):
    """Retrieves the 50 most recent brand design history items."""
    history_items = db.query(History).order_by(History.created_at.desc()).limit(50).all()
    results = []
    for item in history_items:
        item_dict = item.to_dict()
        try:
            # Parse the analysis JSON string into a dictionary for the frontend
            item_dict['analysis'] = json.loads(item_dict['analysis'])
        except (json.JSONDecodeError, TypeError):
            # If parsing fails, provide a fallback error object
            item_dict['analysis'] = {"error": "Invalid analysis format"}
        results.append(item_dict)
    return results


@app.delete("/api/history/{item_id}", status_code=200)
async def delete_history_item(item_id: int, db: Session = Depends(get_db)):
    """Deletes a specific history item by its ID."""
    db_item = db.query(History).filter(History.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="History item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}


# ==============================================================================
# SECTION 6: APPLICATION STARTUP
# ==============================================================================

if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    
    print("===================================================================")
    print("🚀 PsyDesign AI Server is launching...")
    print(f"🔗 Access the application at: http://{host}:{port}")
    print("===================================================================")
    
    # uvicorn.run is used to start the ASGI server.
    # "app:app" tells uvicorn to look for an object named 'app' in a file named 'app.py'.
    # reload=True enables hot-reloading for development, automatically restarting
    # the server when code changes are detected.

    uvicorn.run("app:app", host=host, port=port, reload=True)
