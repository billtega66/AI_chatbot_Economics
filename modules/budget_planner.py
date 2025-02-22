def plan_budget(user_data):
    income = user_data.get('income', 0)
    expenses = user_data.get('expenses', [])
    total_expenses = sum(expenses)
    remaining_budget = income - total_expenses
    return {
        "income": income,
        "total_expenses": total_expenses,
        "remaining_budget": remaining_budget
    }
    