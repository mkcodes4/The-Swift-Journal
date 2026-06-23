import json
import os
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
from tqdm import tqdm
from textblob import TextBlob

# --- CONFIGURATION ---
DATA_PATH = "data/taylor_swift_roberta_analysis_v2.json"
OUTPUT_PATH = "data/taylor_swift_fusion_analysis.json"
SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
EMOTION_MODEL = "j-hartmann/emotion-english-distilroberta-base"

# Temperature for Calibration (T > 1 smoothens, T < 1 sharpens)
TEMPERATURE = 1.25

class FusionEmotionEngine:
    def __init__(self):
        print("🔧 Initializing Fusion Emotion Analysis Engine...")
        self.sent_tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL)
        self.sent_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL)
        self.emot_tokenizer = AutoTokenizer.from_pretrained(EMOTION_MODEL)
        self.emot_model = AutoModelForSequenceClassification.from_pretrained(EMOTION_MODEL)
        
        self.sent_labels = ['negative', 'neutral', 'positive']
        self.emot_labels = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']

    def calibrate(self, logits):
        """Apply Temperature Scaling to the logits and calculate softmax."""
        scaled_logits = logits / TEMPERATURE
        return softmax(scaled_logits)

    def analyze_lyric_signals(self, text):
        # 1. RoBERTa Sentiment
        inputs = self.sent_tokenizer(text[:1500], return_tensors='pt', truncation=True, max_length=512)
        with torch.no_grad():
            sent_logits = self.sent_model(**inputs)[0][0].detach().numpy()
        sent_probs = self.calibrate(sent_logits)
        
        # 2. RoBERTa Emotion
        inputs = self.emot_tokenizer(text[:1500], return_tensors='pt', truncation=True, max_length=512)
        with torch.no_grad():
            emot_logits = self.emot_model(**inputs)[0][0].detach().numpy()
        emot_probs = self.calibrate(emot_logits)
        
        # 3. TextBlob Polarity (normalized to 0-1 range for [Neg, Neu, Pos])
        tb = TextBlob(text).sentiment.polarity
        tb_probs = np.array([max(0, -tb), 1 - abs(tb), max(0, tb)])
        tb_probs = tb_probs / tb_probs.sum() # Normalize
        
        return sent_probs, emot_probs, tb_probs

    def fuse_signals(self, sent_probs, emot_probs, tb_probs):
        """Perform Dynamic Confidence-Weighted Fusion."""
        
        # Calculate individual model confidences (Max probability)
        sent_conf = np.max(sent_probs)
        emot_conf = np.max(emot_probs)
        
        # Dynamic weights based on confidence reliability
        # We value the Emotion model more for lyrics, but Sentiment is a strong anchor
        w_sent = 0.4 * (sent_conf ** 2)
        w_emot = 0.5 * (emot_conf ** 2)
        w_tb = 0.1
        
        # Normalize weights
        total_w = w_sent + w_emot + w_tb
        w_sent /= total_w
        w_emot /= total_w
        w_tb /= total_w
        
        # Align Sentiment (3-vector) with Emotion mapping? 
        # Better Strategy: Blend the distributions and find contradictions.
        
        # Calculate Model Disagreement (KL Divergence simplified)
        # If RoBERTa says positive (idx 2) but Emotion says sadness (idx 5)
        is_contradiction = bool(np.argmax(sent_probs) == 2 and np.argmax(emot_probs) == 5)
        agreement_score = 1.0 - (0.5 if is_contradiction else 0.0)
        
        # Combine normalized scores
        # Mapping mapping Logic:
        final_emotions = {label: float(emot_probs[i] * agreement_score) for i, label in enumerate(self.emot_labels)}
        
        # Final Emotional Label mapping
        primary_emot = max(final_emotions, key=final_emotions.get)
        confidence = float(np.mean([sent_conf, emot_conf]) * agreement_score)
        
        # Refined Thematic Mapping
        final_theme = primary_emot
        if final_emotions['sadness'] > 0.3 and final_emotions['joy'] > 0.2:
            final_theme = "nostalgia"
        elif final_emotions['sadness'] > 0.4 and final_emotions['anger'] > 0.15:
            final_theme = "heartbreak"
        elif final_emotions['joy'] > 0.4 and final_emotions['anger'] > 0.1:
            final_theme = "empowerment"
        
        return {
            "final_emotion": final_theme,
            "confidence": round(confidence, 4),
            "agreement_score": round(agreement_score, 4),
            "is_ambiguous": is_contradiction,
            "emotion_distribution": final_emotions
        }

    def process_dataset(self, songs):
        results = []
        for song in tqdm(songs):
            lyrics = song.get('lyrics', '')
            if not lyrics: continue
            
            sent_p, emot_p, tb_p = self.analyze_lyric_signals(lyrics)
            fusion = self.fuse_signals(sent_p, emot_p, tb_p)
            
            # Update song object
            song.update(fusion)
            results.append(song)
        return results

def main():
    if not os.path.exists(DATA_PATH):
        print(f"File {DATA_PATH} not found.")
        return
        
    with open(DATA_PATH, 'r') as f:
        songs = json.load(f)
        
    engine = FusionEmotionEngine()
    final_data = engine.process_dataset(songs)
    
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(final_data, f, indent=2)
    
    print(f"🔥 Fusion Complete! Calibrated data saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
