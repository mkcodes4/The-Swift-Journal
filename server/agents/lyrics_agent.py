from tools.lyrics_tools import LyricsTools

class LyricsAgent:
    def __init__(self, tools: LyricsTools):
        self.tools = tools

    async def run(self, task: str):
        print(f"[Lyrics Agent] Deterministic Processing: {task}")
        
        # Pure Python search logic
        # We pass the user task directly to the LyricsTools search
        results = self.tools.search_lyrics_content(task)
        
        if not results:
            return {"status": "info", "message": "No specific lyrics found for this query."}
            
        return results
