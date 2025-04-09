from modules.user_input_handler import UserInputHandler

def main():
    # Initialize the handler
    handler = UserInputHandler()
    
    # Example user data
    user_data = {
        "basic_info": {
            "age": 35,
            "gender": "male",
            "annual_income": 75000,
            "current_savings": 50000
        },
        "retirement_goals": {
            "target_retirement_age": 65,
            "desired_annual_income": 60000,
            "life_expectancy": 85
        },
        "current_financials": {
            "monthly_expenses": 3000,
            "debt_amount": 25000,
            "investment_risk_tolerance": "moderate"
        },
        "retirement_accounts": {
            "has_401k": True,
            "has_ira": True,
            "has_roth_ira": False,
            "has_pension": False
        }
    }
    
    # Validate the data
    errors = handler.validate_input(user_data)
    if errors:
        print("Validation errors:")
        for error in errors:
            print(f"- {error}")
    else:
        print("Data is valid!")
        
        # Format and display the data
        formatted_data = handler.format_user_data(user_data)
        print("\nFormatted user data:")
        print(formatted_data)
        
        # Save the data
        try:
            handler.save_user_data(user_data, "data/user_data.json")
            print("\nData saved successfully to data/user_data.json")
        except ValueError as e:
            print(f"Error saving data: {e}")

if __name__ == "__main__":
    main() 