import json
import os
from sentence_transformers import SentenceTransformer, util
import torch

class LyricsTools:
    def __init__(self, data_path: str):
        with open(data_path, 'r') as f:
            self.data = json.load(f)
        
        # We try to load the model, but since this is a local environment
        # we might need to handle cases where dependencies are missing
        try:
            print("[Lyrics Tools] Initializing Semantic Model (all-MiniLM-L6-v2)...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.lyrics_embeddings = self.model.encode([s['lyrics'] for s in self.data], convert_to_tensor=True)
            self.use_semantic = True
        except Exception as e:
            print(f"[Lyrics Tools] Error loading semantic model: {e}")
            self.use_semantic = False

    def search_song(self, song_title: str):
        matches = [s for s in self.data if song_title.lower() in s['title'].lower()]
        if not matches:
            return {"status": "error", "message": f"Song '{song_title}' not found.", "confidence": 0}
            
        song = matches[0]
        return {
            "status": "success",
            "title": song['title'],
            "album": song['album'],
            "lyrics_snippet": song['lyrics'][:300],
            "sentiment": song['roberta_label'],
            "confidence": 1.0
        }

    def semantic_search(self, query: str):
        if not self.use_semantic:
            return {"status": "error", "message": "Semantic search engine is currently unavailable."}
            
        print(f"[Lyrics Tools] Performing semantic search for: '{query}'")
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        cos_scores = util.cos_sim(query_embedding, self.lyrics_embeddings)[0]
        top_results = torch.topk(cos_scores, k=min(15, len(self.data)))
        
        matches = []
        for score, idx in zip(top_results[0], top_results[1]):
            song = self.data[idx]
            matches.append({
                "title": song['title'],
                "album": song['album'],
                "score": float(score)
            })
            
        return {
            "status": "success",
            "matches": matches,
            "confidence": float(top_results[0][0])
        }

    def search_lyrics_content(self, keyword_query: str):
        keywords = keyword_query.lower().split()
        matches = []
        for song in self.data:
            lyrics = song['lyrics'].lower()
            if any(k in lyrics for k in keywords):
                matches.append(song)
        
        results = sorted(matches, key=lambda x: sum(k in x['lyrics'].lower() for k in keywords), reverse=True)[:5]
        
        return {
            "status": "success",
            "matches": [{"title": m['title'], "album": m['album']} for m in results],
            "confidence": 0.9 if results else 0
        }
