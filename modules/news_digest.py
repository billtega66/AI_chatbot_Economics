from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import logging
import requests

# Initialize Flask app
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.ERROR)

# Get the absolute path of the `news_data.json` file
file_path = os.path.join(os.path.dirname(__file__), '../data/news_data.json')

# Load news data
try:
    with open(file_path, 'r') as file:
        news_data = json.load(file)
except FileNotFoundError:
    logging.error(f"File not found: {file_path}")
    news_data = []

# Ollama API Base URL
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi4"  # Using Phi-4 model

def generate_summary(text):
    """
    Calls the Ollama API to generate a summary.
    Returns a summarized version of the text (3-5 sentences).
    """
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": f"Pretend you are an expert economist, using the text which were alredy provided, summarize the article in about 3 to 5 sentences. Make sure that summarized article is clear enough and easy to read. Here is the text to summarize:\n\n{text}",
            "stream": False
        }
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        summary = response.json().get("response", "").strip()
        return summary if summary else "Error generating summary"
    except requests.exceptions.RequestException as e:
        logging.error(f"Error generating summary: {e}")
        return "Error generating summary"

@app.route('/api/news-digest', methods=['GET'])
def get_news_digest():
    """
    Returns all news articles with AI-generated summaries.
    Summaries are generated and cached in the `news_data.json` file.
    """
    for article in news_data:
        if not article.get('aiSummary') or article['aiSummary'] == "Error generating summary":
            article['aiSummary'] = generate_summary(article['originalSummary'])

    # **Fixed Indentation Here**
    with open(file_path, 'w') as file:
        json.dump(news_data, file, indent=4)

    return jsonify(news_data)

@app.route('/api/news-digest/<int:article_id>', methods=['GET'])
def get_article_by_id(article_id):
    """
    Returns a specific article by its ID.
    """
    article = next((item for item in news_data if item['id'] == article_id), None)
    if article:
        
        return jsonify(article)
    else:
        return jsonify({"error": "Article not found"}), 404

if __name__ == '__main__':
    app.run(port=5001, debug=True)
