import json
from tools.stats_tools import StatsTools

class StatisticsAgent:
    def __init__(self, tools: StatsTools):
        self.tools = tools
        self.known_albums = [
            "Taylor Swift", "Fearless", "Speak Now", "Red", "1989", 
            "reputation", "Lover", "Folklore", "Evermore", "Midnights", 
            "TTPD", "The Tortured Poets Department"
        ]

    async def run(self, task: str):
        print(f"[Stats Agent] Deterministic Processing: {task}")
        
        # 1. Identify all mentioned albums
        found_albums = []
        for album in self.known_albums:
            if album.lower() in task.lower():
                found_albums.append(album)
        
        # 2. Logic based on number of albums found
        if len(found_albums) >= 2:
            print(f"[Stats Agent] Comparing: {found_albums[0]} vs {found_albums[1]}")
            return self.tools.compare_albums(found_albums[0], found_albums[1])
            
        if len(found_albums) == 1:
            print(f"[Stats Agent] Analyzing: {found_albums[0]}")
            return self.tools.get_album_stats(found_albums[0])
        
        return {"status": "error", "message": "No specific album names recognized in the query."}
