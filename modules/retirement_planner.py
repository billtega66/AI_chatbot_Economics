def calculate_retirement(user_input):
    current_age = user_input.get('current_age')
    retirement_age = user_input.get('retirement_age')
    savings = user_input.get('savings')
    annual_contribution = user_input.get('annual_contribution')
    # Placeholder for retirement calculation
    years_left = retirement_age - current_age
    total_savings = savings + (annual_contribution * years_left)
    return {
        "years_left": years_left,
        "total_savings": total_savings
    }
