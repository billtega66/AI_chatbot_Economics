from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend-backend communication

# Path to your market data file
DATA_FILE = os.path.join(os.path.dirname(__file__), '../data/market_data.json')

# Serve a basic response for the root route
@app.route('/')
def home():
    return "Market Watchdog Backend is Running", 200

# Handle favicon.ico request (optional)
@app.route('/favicon.ico')
def favicon():
    return '', 204

# Endpoint to fetch market data
@app.route('/api/getMarketData', methods=['GET'])
def get_market_data():
    try:
        with open(DATA_FILE, 'r') as file:
            data = json.load(file)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint to save updated market data
@app.route('/api/saveMarketData', methods=['POST'])
def save_market_data():
    try:
        updated_data = request.get_json()  # Get the JSON data from the request
        with open(DATA_FILE, 'w') as file:
            json.dump(updated_data, file, indent=2)  # Save to file
        return jsonify({'message': 'Data saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(port=5000)
