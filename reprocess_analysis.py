import json
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
import numpy as np
from tqdm import tqdm

# --- CONFIGURATION ---
DATA_PATH = "data/taylor_swift_roberta_analysis.json"
OUTPUT_PATH = "data/taylor_swift_roberta_analysis_v2.json"
SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
EMOTION_MODEL = "j-hartmann/emotion-english-distilroberta-base"

def analyze_text(text, tokenizer, model, labels):
    """Analyze a single chunk of text and return the scores."""
    # RoBERTa has a 512 token limit. We chunk the lyrics if they are too long.
    inputs = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
    with torch.no_grad():
        output = model(**inputs)
    
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)
    
    # Map scores to labels
    result = {labels[i]: float(scores[i]) for i in range(len(labels))}
    return result

def main():
    print("🚀 Initializing Taylor Swift Analysis Engine...")
    
    # 1. Load Data
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: {DATA_PATH} not found!")
        return

    with open(DATA_PATH, 'r') as f:
        songs = json.load(f)

    # 2. Load Models
    print(f"📥 Loading Sentiment Model: {SENTIMENT_MODEL}...")
    sent_tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL)
    sent_model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL)
    sent_labels = ['negative', 'neutral', 'positive']

    print(f"📥 Loading Emotion Model: {EMOTION_MODEL}...")
    emot_tokenizer = AutoTokenizer.from_pretrained(EMOTION_MODEL)
    emot_model = AutoModelForSequenceClassification.from_pretrained(EMOTION_MODEL)
    emot_labels = ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']

    # 3. Process Songs
    print(f"🔍 Analyzing {len(songs)} songs. This might take a few minutes...")
    
    for song in tqdm(songs):
        lyrics = song.get('lyrics', '')
        if not lyrics:
            continue

        # Simple chunking for very long songs
        sent_scores = analyze_text(lyrics[:2000], sent_tokenizer, sent_model, sent_labels)
        emot_scores = analyze_text(lyrics[:2000], emot_tokenizer, emot_model, emot_labels)

        # Update Song Object
        song['roberta_label'] = max(sent_scores, key=sent_scores.get)
        song['roberta_confidence'] = sent_scores[song['roberta_label']]
        
        # Add Emotions (Bonus Data)
        song['emotions'] = emot_scores
        song['primary_emotion'] = max(emot_scores, key=emot_scores.get)

    # 4. Save Results
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(songs, f, indent=2)

    print(f"\n✅ Analysis Complete! New data saved to: {OUTPUT_PATH}")
    print("To use this for your Agents, copy it to server/data/ folder.")

if __name__ == "__main__":
    main()
