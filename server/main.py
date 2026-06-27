import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from agents.coordinator import SwiftieCoordinator
from agents.lyrics_agent import LyricsAgent
from agents.stats_agent import StatisticsAgent
from tools.lyrics_tools import LyricsTools
from tools.stats_tools import StatsTools
from core.memory import ChatMemory

load_dotenv()

app = FastAPI(title="Swiftie Multi-Agent API")

# --- CORS ---
# In production, restrict to your Vercel domain via the ALLOWED_ORIGIN env var.
# Locally, all origins are permitted so development stays seamless.
allowed_origin = os.getenv("ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin] if allowed_origin != "*" else ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# Initialize Shared State
API_KEY = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "taylor_swift_roberta_analysis_v3.json")

memory = ChatMemory()
lyrics_tools = LyricsTools(DATA_PATH)
stats_tools = StatsTools(DATA_PATH)

lyrics_agent = LyricsAgent(lyrics_tools)
# Pass API_KEY to StatsAgent for smarter album extraction
stats_agent = StatisticsAgent(stats_tools)

coordinator = SwiftieCoordinator(API_KEY, lyrics_agent, stats_agent)

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_user"

class SearchRequest(BaseModel):
    query: str

@app.post("/search")
async def search_endpoint(request: SearchRequest):
    try:
        print(f"\n--- New Search Request: {request.query} ---")
        # Use the semantic search tool directly for high-speed results
        # This bypasses the full multi-agent synthesis for the discovery page
        results = lyrics_tools.semantic_search(request.query)
        return results
    except Exception as e:
        print(f"Search Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"\n--- New Request: {request.query} ---")
        # Get Context
        context = memory.get_context_string(request.session_id)
        
        # Process Query via Multi-Agent System
        result = await coordinator.handle_query(request.query, context)
        
        # Save to Memory
        memory.add_message(request.session_id, "user", request.query)
        memory.add_message(request.session_id, "agent", result['answer'])
        
        print(f"--- Final Answer Sent! ---\n")
        return result
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "online", "system": "multi-agent-v1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
