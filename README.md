# Taylor Swift Discography Analysis

## Project Overview
This project is a deep dive into the lyrical world of Taylor Swift's discography, powered by Python and AI. It explores her eras, themes, and vocabulary through data analysis, natural language processing, and generative AI. 

At its core, this is a personal passion project. The main purpose was to learn and experiment with data analysis, discovering firsthand how code can be used to uncover patterns in unstructured text and transform raw lyrics into measurable insights.

## What I Learned
Building this project was a fantastic hands-on experience. Throughout the process, I developed skills in:
* **Data Cleaning:** Processing messy, unstructured text data (lyrics) into clean, usable formats.
* **Data Exploration:** Understanding datasets and finding hidden patterns across different eras and albums.
* **Data Visualization:** Translating numbers and text into charts and visual insights.
* **Python Ecosystem:** Working extensively with Python libraries and understanding how they interact to form a complete data pipeline.
* **Natural Language Processing (NLP):** Extracting sentiment and semantic meaning from lyrics.
* **AI Integration:** Connecting Large Language Models (LLMs) to custom data to build context-aware chat agents.

## Technologies Used
* **Python** - The core programming language for the analysis and backend.
* **Pandas** - For data manipulation, filtering, and cleaning.
* **Hugging Face / SentenceTransformers** - For semantic search and sentiment analysis of the lyrics.
* **Google Gemini API** - For powering the interactive Swiftie Chat Agent.
* **FastAPI** - To serve the analyzed data to a frontend.
* **Next.js & React** - For building the interactive web application.

## Project Features
* **AI Chat Agent:** An interactive, conversational assistant powered by Gemini that can discuss Taylor's lyrics, lore, and eras using the analyzed dataset as context.
* **Semantic Search:** A "Vault Search" that finds lyrics based on vibes and themes rather than just exact keyword matches.
* **Lyrical Exploration:** Exploring trends, word counts, and themes across all 14 eras of Taylor Swift's music.
* **Pattern Recognition:** Analyzing how the emotional tone and vocabulary of her albums shift over time.

## Project Structure
```text
The-Swift-Journal/
│
├── data/                       # Contains raw and processed CSV/JSON datasets (v3 final)
├── notebooks/                  # Jupyter notebooks used for data exploration and cleaning
├── server/
│   ├── agents/                 # AI agents and coordination logic (Gemini Chat)
│   ├── tools/                  # Python scripts for lyrics analysis and semantic search
│   └── main.py                 # FastAPI backend server
│
├── app/                        # Next.js frontend application
├── components/                 # React components for the UI
└── README.md                   # This file
```

## Future Improvements
This project is always evolving as I learn new things. Some possible ideas for the future include:
* **Adding More Datasets:** Incorporating Spotify streaming numbers or Grammy award data to find correlations with lyrical sentiment.
* **Creating Interactive Dashboards:** Building more robust and interactive data visualizations for users to explore.
* **Improving Analysis Methods:** Experimenting with different machine learning models to classify themes (e.g., heartbreak, revenge, nostalgia) more accurately.
