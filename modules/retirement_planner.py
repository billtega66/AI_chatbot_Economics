import uuid
from datetime import datetime
import os
import json
import faiss
import numpy as np
import ollama
from sentence_transformers import SentenceTransformer, CrossEncoder
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from jinja2 import Template
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from modules.utils import clean_rag_facts
import random

router = APIRouter(prefix="/api/retirement")

class RetirementInput(BaseModel):
    age: int
    currentSavings: float
    income: float
    retirementAge: int
    retirementSavingsGoal: float
    gender: Optional[str] = None
    currentJob: Optional[str] = None
    spending: Optional[float] = None
    hasMortgage: Optional[str] = "no"
    mortgageAmount: Optional[float] = None
    mortgageTerm: Optional[int] = None
    downPayment: Optional[float] = None
    downPaymentPercent: Optional[float] = None
    assets: Optional[float] = None
    hasInsurance: Optional[str] = "no"
    insurancePayment: Optional[float] = None
    hasInvestment: Optional[str] = "no"
    investmentAmount: Optional[float] = None
# ────────────────────────────────────────────────────────────────────────────────
# 1. Models and Index Setup
# ────────────────────────────────────────────────────────────────────────────────

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

index = faiss.IndexFlatL2(384)
document_store = []

# ────────────────────────────────────────────────────────────────────────────────
# 2. Load and Index `.txt` File (RAG Context)
# ────────────────────────────────────────────────────────────────────────────────

def process_retirement_text(file_path="data/retirement_facts.txt"):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", "!", "?"],
        length_function=len
    )
    doc = Document(page_content=text)
    splits = text_splitter.split_documents([doc])

    embeddings = [embedding_model.encode(split.page_content) for split in splits]
    index.add(np.array(embeddings, dtype=np.float32))
    document_store.extend([split.page_content for split in splits])
    return {"message": f"Indexed {len(splits)} chunks from retirement_fact.txt"}

# ────────────────────────────────────────────────────────────────────────────────
# 3. Semantic Search + Reranking
# ────────────────────────────────────────────────────────────────────────────────

def retrieve_with_rerank(prompt: str, k=8, top_n=3) -> str:
    if not document_store:
        return "No documents indexed."

    query_embedding = embedding_model.encode([prompt])[0]
    D, I = index.search(np.array([query_embedding], dtype=np.float32), k)
    candidates = [document_store[i] for i in I[0] if i < len(document_store)]

    pairs = [(prompt, doc) for doc in candidates]
    scores = cross_encoder.predict(pairs)

    top_docs = [doc for doc, _ in sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)][:top_n]
    return "\n\n".join(top_docs)

# ────────────────────────────────────────────────────────────────────────────────
# 4. Load and Flatten Structured JSON Facts
# ────────────────────────────────────────────────────────────────────────────────

def load_retirement_facts():
    with open("data/retirement_data.json") as f:
        data = json.load(f)
    return data.get("retirement_facts", {})

def flatten_facts(facts: dict) -> str:
    def flatten(d, prefix=''):
        lines = []
        for k, v in d.items():
            if isinstance(v, dict):
                lines.extend(flatten(v, prefix + k.replace("_", " ") + ": "))
            else:
                lines.append(f"{prefix}{k.replace('_', ' ')}: {v}")
        return lines
    return "\n".join(flatten(facts))

# ────────────────────────────────────────────────────────────────────────────────
# 5. Format User Input
# ────────────────────────────────────────────────────────────────────────────────

def format_user_data(user_input):
    return {
        'age': user_input.get('age', ''),
        'savings': user_input.get('currentSavings', ''),
        'gender': user_input.get('gender', ''),
        'job': user_input.get('currentJob', ''),
        'income': user_input.get('income', ''),
        'spending': user_input.get('spending', ''),
        'has_mortgage': user_input.get('hasMortgage', '') == 'yes',
        'mortgage_balance': user_input.get('mortgageAmount', ''),
        'mortgage_term': user_input.get('mortgageTerm', ''),
        'down_payment': user_input.get('downPayment', ''),
        'down_payment_percent': user_input.get('downPaymentPercent', ''),
        'assets': user_input.get('assets', ''),
        'has_insurance': user_input.get('hasInsurance', '') == 'yes',
        'insurance_payment': user_input.get('insurancePayment', ''),
        'has_investment': user_input.get('hasInvestment', '') == 'yes',
        'investment_value': user_input.get('investmentAmount', ''),
        'retirement_age': user_input.get('retirementAge', ''),
        'retirement_goal': user_input.get('retirementSavingsGoal', '')
    }

# ────────────────────────────────────────────────────────────────────────────────
# 6. Prompt Generator: User + JSON + RAG
# ────────────────────────────────────────────────────────────────────────────────

def create_prompt(user_data: dict, json_facts: str, rag_context: str) -> tuple[str, str]:
    system_prompt = "You are a retirement planning assistant. Use structured facts, retrieved context, and user input."

    user_template = """
    [User Info]
    Age: {{ age }}
    Income: ${{ income }}
    Savings: ${{ savings }}
    Retirement Goal: ${{ retirement_goal }}
    Retirement Age: {{ retirement_age }}
    {% if has_mortgage %}
    Mortgage: ${{ mortgage_balance }} over {{ mortgage_term }} years
    {% endif %}
    {% if has_investment %}
    Investments: ${{ investment_value }}
    {% endif %}

    [Structured Facts]
    {{ json_facts }}

    [Retrieved Context]
    {{ rag_context }}

    [Request]
    Please generate a detailed and personalized retirement strategy using all the information above.
    """

    full_prompt = Template(user_template).render(**user_data, json_facts=json_facts, rag_context=rag_context)
    return system_prompt, full_prompt

# ────────────────────────────────────────────────────────────────────────────────
# 7. Call Ollama
# ────────────────────────────────────────────────────────────────────────────────

def call_ollama(system_prompt, user_prompt):
    try:
        response = ollama.chat(
            model="mistral:7b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response["message"]["content"]
    except Exception as e:
        print("❌ Ollama call failed:", e)
        return "Ollama failed to generate a response."
# ────────────────────────────────────────────────────────────────────────────────
# 7.5. Helpers (optional)
# ────────────────────────────────────────────────────────────────────────────────

def generate_mortgage_section(user_input):
    if user_input.get("hasMortgage", "no").lower() == "yes":
        mortgage = float(user_input.get("mortgageAmount", 0))
        term = int(user_input.get("mortgageTerm", 0))
        dp = float(user_input.get("downPaymentPercent", 0))

        if mortgage < 10000:
            return "You do not appear to have significant mortgage obligations at this time. This provides greater financial flexibility in early career stages."

        return (
            f"You currently hold a mortgage of ${mortgage:,.0f} over {term} years. "
            f"Paying it off before retirement can reduce fixed monthly costs and improve cash flow. "
            f"With a {dp:.1f}% down payment, you're likely positioned well if the interest rate is favorable."
        )
    return "No mortgage noted. This gives you greater flexibility in savings allocation."


# def build_retirement_plan(user_input, rag_facts):

    

#     age = int(user_input.get("age"))
#     retirement_age = int(user_input.get("retirementAge"))
#     income = float(user_input.get("income", 0))
#     savings = float(user_input.get("currentSavings", 0))
#     goal = float(user_input.get("retirementSavingsGoal", 0))

#     years_left = retirement_age - age
#     projected_savings = savings + (income * 0.15 * years_left)
#     gap = goal - projected_savings

#     gap_status = (
#         "✅ You're on track to meet your retirement goal. Keep maintaining your current savings and investment habits!"
#         if gap <= 0
#         else f"⚠️ You're projected to be **${gap:,.0f} short**. Consider increasing your savings rate, boosting income, or adjusting your retirement timeline."
#     )

#     # Deduplicate retrieved facts
#     unique_facts = list(dict.fromkeys(rag_facts.strip().splitlines()))
#     selected_facts = "\n".join(unique_facts[:10])

#     plan = f"""
# ## 🧓 Personalized Retirement Plan for You

# **Age**: {age}  
# **Current Income**: ${income:,.0f}  
# **Current Savings**: ${savings:,.0f}  
# **Target Retirement Age**: {retirement_age}  
# **Retirement Goal**: ${goal:,.0f}  
# **Years Left to Save**: {years_left}  
# **Projected Savings at Retirement**: ${projected_savings:,.0f}  
# **Status**: {gap_status}

# ---

# ### 📈 Growth Strategy

# Based on a 15% annual savings rate and historical stock/bond returns, you could reach a projected savings of **${projected_savings:,.0f}**. To meet your goal, aim for:

# - Maxing out tax-advantaged accounts (401(k), IRA)
# - Maintaining a diversified portfolio of stocks and bonds
# - Adjusting your savings rate annually

# ---

# ### 🛡 Healthcare & Risk

# - Plan for at least **$300,000** in lifetime healthcare costs  
# - Consider long-term care and supplemental insurance  
# - Keep an emergency fund (1–2 years of expenses in retirement)

# ---

# ### 🧮 Mortgage

# {generate_mortgage_section(user_input)}

# ---

# ### 💡 Recommendations

# - Increase your savings rate if possible  
# - Consider delaying retirement by a few years  
# - Rebalance your investment portfolio annually  
# - Consider annuities or income products for guaranteed payouts  
# - Meet with a retirement advisor every 2–3 years

# ---

# ### 📚 Fact-Based Insights

# {selected_facts}
# """
#     return plan


# ────────────────────────────────────────────────────────────────────────────────
# 8. Generate Retirement Plan
# ────────────────────────────────────────────────────────────────────────────────

def create_retirement_plan(user_input: dict):
    # Extract and calculate all metrics using Python
    current_age = int(user_input.get('age', 0))
    retirement_age = int(user_input.get('retirementAge', 0))
    current_savings = float(user_input.get('currentSavings', 0))
    income = float(user_input.get('income', 0))
    goal = float(user_input.get('retirementSavingsGoal', 0))
    gender = user_input.get('gender', '')
    current_job = user_input.get('currentJob', '')
    has_mortgage = user_input.get('hasMortgage', 'no') == 'yes'
    mortgage_amount = float(user_input.get('mortgageAmount', 0))
    has_investment = user_input.get('hasInvestment', 'no') == 'yes'
    investment_amount = float(user_input.get('investmentAmount', 0))
    
    # Calculate all metrics
    years_left = retirement_age - current_age
    annual_contribution = income * 0.15
    annual_return = 0.065
    
    # Projected savings calculation
    projected_savings = current_savings * (1 + annual_return) ** years_left
    for year in range(years_left):
        projected_savings += annual_contribution * (1 + annual_return) ** (years_left - year - 1)
    
    # Calculate gap and required savings rate
    gap = goal - projected_savings
    required_savings_rate = (goal - current_savings) / (income * years_left)
    required_savings_rate = min(max(required_savings_rate, 0.15), 0.50)
    
    # Calculate benchmarks
    age_benchmarks = {
        30: 1.0,
        35: 2.0,
        40: 3.0,
        45: 4.0,
        50: 6.0,
        55: 7.0,
        60: 8.0,
        65: 10.0
    }
    
    benchmark_age = min(age_benchmarks.keys(), key=lambda x: abs(x - current_age))
    benchmark_multiplier = age_benchmarks[benchmark_age]
    benchmark_savings = income * benchmark_multiplier
    
    # Calculate percentages for context
    mortgage_percentage = mortgage_amount/income*100 if has_mortgage else 0
    investment_percentage = investment_amount/current_savings*100 if current_savings > 0 and has_investment else 0
    
    # Prepare structured data for LLM
    plan_data = {
        "user_profile": {
            "age": current_age,
            "gender": gender,
            "job": current_job,
            "income": income,
            "current_savings": current_savings,
            "retirement_age": retirement_age,
            "retirement_goal": goal,
            "years_until_retirement": years_left
        },
        "financial_metrics": {
            "projected_savings": projected_savings,
            "gap_to_goal": gap,
            "required_savings_rate": required_savings_rate,
            "benchmark_savings": benchmark_savings,
            "annual_contribution": annual_contribution,
            "annual_return": annual_return
        },
        "assets": {
            "has_mortgage": has_mortgage,
            "mortgage_amount": mortgage_amount,
            "mortgage_percentage": mortgage_percentage,
            "has_investments": has_investment,
            "investment_amount": investment_amount,
            "investment_percentage": investment_percentage
        },
        "assumptions": {
            "savings_rate": 0.15,
            "return_rate": 0.065,
            "inflation_rate": 0.03
        }
    }
    
    # Create prompt for LLM
    system_prompt = """You are a retirement planning expert. Create a personalized retirement plan using the provided data.
    The plan should be conversational, supportive, and actionable. Include specific numbers and percentages.
    Structure the response with clear sections using markdown formatting."""
    
    user_prompt = f"""Create a retirement plan using this data:
    {json.dumps(plan_data, indent=2)}
    
    Guidelines:
    1. Start with a personalized introduction mentioning age, job, and current savings
    2. Include specific numbers and percentages throughout
    3. Provide context for mortgage and investment percentages
    4. Explain projections clearly with assumptions
    5. Give timeline-specific recommendations
    6. End with a motivational closing based on their progress
    7. Use markdown formatting with emojis for sections
    8. Keep the tone professional yet conversational
    
    Format the response as a markdown document with these sections:
    ## 🎯 Your Personalized Retirement Plan
    [Introduction]
    
    ### 📊 Current Status
    [Key metrics and context]
    
    ### 📈 Projections
    [Future outlook with assumptions]
    
    ### 🎯 Action Plan
    [Timeline-specific recommendations]
    
    ### 💡 Key Recommendations
    [Actionable steps]
    
    ### ⚠️ Watch-outs
    [Risk factors and considerations]
    
    ### 🌟 Final Thoughts
    [Motivational closing]"""
    
    # Call LLM to generate the narrative
    try:
        llm_response = call_ollama(system_prompt, user_prompt)
        plan = llm_response
    except Exception as e:
        print(f"Error generating plan with LLM: {str(e)}")
        # Fallback to Python-generated plan if LLM fails
        plan = generate_fallback_plan(plan_data)
    
    return {
        "plan": plan,
        "projected_savings": projected_savings,
        "years_left": years_left,
        "gap": gap,
        "required_savings_rate": required_savings_rate,
        "status": "success"
    }

def generate_fallback_plan(plan_data):
    """Generate a basic plan using Python if LLM fails"""
    user = plan_data["user_profile"]
    metrics = plan_data["financial_metrics"]
    assets = plan_data["assets"]
    
    return f"""## 🎯 Your Personalized Retirement Plan

Based on your profile as a {user['age']}-year-old {user['gender']} working as a {user['job']}, 
with ${user['current_savings']:,.0f} saved, you're {'ahead of' if user['current_savings'] >= metrics['benchmark_savings'] else 'behind'} 
the benchmark of ${metrics['benchmark_savings']:,.0f} for your age and income.

### 📊 Current Status
- Age: {user['age']}
- Current Savings: ${user['current_savings']:,.0f}
- Annual Income: ${user['income']:,.0f}
- Target Retirement Age: {user['retirement_age']}
- Retirement Goal: ${user['retirement_goal']:,.0f}
- Years Until Retirement: {user['years_until_retirement']}

### 📈 Projections
At your current savings rate of 15%, you're projected to have ${metrics['projected_savings']:,.0f} by retirement age {user['retirement_age']}.
This projection assumes:
- Annual savings rate of 15% (${metrics['annual_contribution']:,.0f})
- Average annual return of 6.5%
- No major withdrawals before retirement
- Consistent income growth with inflation

### 🎯 Action Plan
- Increase savings rate to {metrics['required_savings_rate']:.1%} of income
- Automate contributions to retirement accounts
- Review and rebalance portfolio annually
- Consider working with a financial advisor
- Build an emergency fund (3-6 months of expenses)

### ⚠️ Watch-outs
- Market volatility may impact short-term returns
- Healthcare costs in retirement
- Potential changes to Social Security
- Inflation impact on purchasing power

### 🌟 Final Thoughts
{'You\'re in a great position — with consistency and smart investing, you\'re on track to retire comfortably. Keep the momentum going!' if metrics['gap_to_goal'] <= 0 else 'While there\'s work to be done, remember that every step forward counts. Stay committed to your plan, and you\'ll build the retirement you deserve.'}"""


# ────────────────────────────────────────────────────────────────────────────────
# 9. Save User Profile
# ────────────────────────────────────────────────────────────────────────────────
def save_user_profile(user_input: dict, path="data/retirement_user_data.json"):
    entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "data": user_input
    }

    try:
        if os.path.exists(path):
            with open(path, "r") as f:
                all_data = json.load(f)
        else:
            all_data = []

        all_data.append(entry)

        with open(path, "w") as f:
            json.dump(all_data, f, indent=2)

    except Exception as e:
        print(f"Error saving user input: {e}")

# ────────────────────────────────────────────────────────────────────────────────
# 10. Load All User Profiles
# ────────────────────────────────────────────────────────────────────────────────

def load_all_user_profiles(path="data/retirement_user_data.json"):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)
       
# ────────────────────────────────────────────────────────────────────────────────
# 11. Optional Projection
# ────────────────────────────────────────────────────────────────────────────────

def calculate_retirement(user_input):
    save_user_profile(user_input)

    # Generate the retirement plan
    plan_data = create_retirement_plan(user_input)
    
    # Ensure we have all required fields
    if not plan_data or 'plan' not in plan_data:
        raise ValueError("Failed to generate retirement plan")
    
    # Structure the response
    result = {
        "retirement_plan": {
            "plan": plan_data["plan"],
            "projected_savings": plan_data["projected_savings"],
            "years_left": plan_data["years_left"],
            "gap": plan_data["gap"],
            "required_savings_rate": plan_data["required_savings_rate"]
        },
        "status": "success"
    }
    
    return result

@router.post("/plan")
async def generate_retirement_plan(user_input: RetirementInput):
    try:
        result = calculate_retirement(user_input.model_dump())
        return result
    except Exception as e:
        print(f"Error generating retirement plan: {str(e)}")
        return {
            "error": str(e),
            "status": "error"
        }

@router.get("/user_profiles")
def get_user_profiles():
    try:
        profiles = load_all_user_profiles()
        return {"profiles": profiles}
    except Exception as e:
        return {"error": str(e)}
