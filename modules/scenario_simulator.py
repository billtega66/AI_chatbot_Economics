def simulate(scenario):
    interest_rate = scenario.get('interest_rate', 0)
    inflation_rate = scenario.get('inflation_rate', 0)
    unemployment_rate = scenario.get('unemployment_rate', 0)
    # Placeholder for scenario simulation
    return {
        "impact": f"Simulating with IR={interest_rate}, INF={inflation_rate}, UN={unemployment_rate}"
    }
    