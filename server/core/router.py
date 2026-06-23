import re

class IntentRouter:
    def __init__(self):
        # Define keywords mapping to intents
        self.rules = [
            (r"\b(lyric|lyrics|sing|line|verse|song for|words in)\b", "lyrics_search"),
            (r"\b(stat|stats|average|score|percent|count|number)\b", "album_stats"),
            (r"\b(compare|versus|vs|difference|better than|more positive|more sad)\b", "comparison"),
            (r"\b(recommend|suggest|what should i listen to|similar to)\b", "recommendation"),
            (r"\b(theme|feeling|emotion|vibe|mood|heartbreak|joy|nostalgia)\b", "theme_lookup")
        ]

    def route(self, query: str):
        query = query.lower()
        matched_intents = []
        
        for pattern, intent in self.rules:
            if re.search(pattern, query):
                matched_intents.append(intent)
        
        # If no specific intent found, default to general chat
        if not matched_intents:
            return {"intent": "general", "confidence": 0.5}
            
        # For now, pick the first match (can be improved to multiple if needed)
        # Use high confidence if a matching keyword is found
        return {
            "intent": matched_intents[0],
            "confidence": 0.9,
            "all_intents": matched_intents
        }
