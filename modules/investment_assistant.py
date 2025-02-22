def get_recommendations(user_profile):
    risk_tolerance = user_profile.get('risk_tolerance', 'moderate')
    goals = user_profile.get('goals', 'long_term')
    # Placeholder logic for investment advice
    return {
        "risk_tolerance": risk_tolerance,
        "goals": goals,
        "recommendation": "Diversify with a mix of stocks and bonds."
    }
