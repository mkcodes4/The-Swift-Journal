import json
import os
import numpy as np

class StatsTools:
    def __init__(self, data_path: str):
        with open(data_path, 'r') as f:
            self.data = json.load(f)

    def get_album_stats(self, album_name: str):
        print(f"[Stats Tool] Searching for album: '{album_name}'")
        album_songs = [s for s in self.data if s['album'].lower() == album_name.lower().strip()]
        if not album_songs:
            return {"status": "error", "message": f"Album '{album_name}' not found."}
        
        positivity = [s.get('roberta_confidence', 0) for s in album_songs if s.get('roberta_label') == 'positive']
        negativity = [s.get('roberta_confidence', 0) for s in album_songs if s.get('roberta_label') == 'negative']
        
        return {
            "status": "success",
            "album": album_name,
            "song_count": len(album_songs),
            "avg_positivity": float(np.mean(positivity)) if positivity else 0,
            "avg_negativity": float(np.mean(negativity)) if negativity else 0,
            "confidence": 1.0
        }

    def compare_albums(self, album1_name: str, album2_name: str):
        stats1 = self.get_album_stats(album1_name)
        stats2 = self.get_album_stats(album2_name)
        
        if stats1['status'] == 'error' or stats2['status'] == 'error':
            return {"status": "error", "message": "One or both albums not found."}
            
        return {
            "status": "success",
            "comparison": {
                album1_name: stats1,
                album2_name: stats2
            },
            "winner_positivity": album1_name if stats1['avg_positivity'] > stats2['avg_positivity'] else album2_name,
            "confidence": 1.0
        }
