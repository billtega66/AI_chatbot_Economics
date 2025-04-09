from flask import Flask, request, jsonify
from modules import (
    market_watchdog,
    investment_assistant,
    news_digest,
    budget_planner,
    glossary_explainer,
    scenario_simulator,
    retirement_planner,
)
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Economic Chatbot!"

@app.route('/market-watchdog', methods=['POST'])
def market_watchdog_route():
    data = request.json
    response = market_watchdog.check_market(data)
    return jsonify(response)

# @app.route('/investment-assistant', methods=['POST'])
# def investment_assistant_route():
#     data = request.json
#     response = investment_assistant.get_recommendations(data)
#     return jsonify(response)

# @app.route('/news-digest', methods=['GET'])
# def news_digest_route():
#     response = news_digest.get_latest_news()
#     return jsonify(response)

# @app.route('/budget-planner', methods=['POST'])
# def budget_planner_route():
#     data = request.json
#     response = budget_planner.plan_budget(data)
#     return jsonify(response)

# @app.route('/glossary', methods=['GET'])
# def glossary_route():
#     term = request.args.get('term', '')
#     response = glossary_explainer.explain(term)
#     return jsonify(response)

# @app.route('/scenario-simulator', methods=['POST'])
# def scenario_simulator_route():
#     data = request.json
#     response = scenario_simulator.simulate(data)
#     return jsonify(response)

@app.route('/api/retirement/plan', methods=['POST'])
def retirement_planner_route():
    try:
        data = request.json
        logger.info(f"Received retirement planning request")
        
        # Call the retirement planner module with RAG functionality
        response = retirement_planner.calculate_retirement(data)
        
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error in retirement planner route: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
