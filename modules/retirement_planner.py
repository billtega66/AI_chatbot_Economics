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


def build_retirement_plan(user_input, rag_facts):

    

    age = int(user_input.get("age"))
    retirement_age = int(user_input.get("retirementAge"))
    income = float(user_input.get("income", 0))
    savings = float(user_input.get("currentSavings", 0))
    goal = float(user_input.get("retirementSavingsGoal", 0))

    years_left = retirement_age - age
    projected_savings = savings + (income * 0.15 * years_left)
    gap = goal - projected_savings

    gap_status = (
        "✅ You're on track to meet your retirement goal. Keep maintaining your current savings and investment habits!"
        if gap <= 0
        else f"⚠️ You're projected to be **${gap:,.0f} short**. Consider increasing your savings rate, boosting income, or adjusting your retirement timeline."
    )

    # Deduplicate retrieved facts
    unique_facts = list(dict.fromkeys(rag_facts.strip().splitlines()))
    selected_facts = "\n".join(unique_facts[:10])

    plan = f"""
## 🧓 Personalized Retirement Plan for You

**Age**: {age}  
**Current Income**: ${income:,.0f}  
**Current Savings**: ${savings:,.0f}  
**Target Retirement Age**: {retirement_age}  
**Retirement Goal**: ${goal:,.0f}  
**Years Left to Save**: {years_left}  
**Projected Savings at Retirement**: ${projected_savings:,.0f}  
**Status**: {gap_status}

---

### 📈 Growth Strategy

Based on a 15% annual savings rate and historical stock/bond returns, you could reach a projected savings of **${projected_savings:,.0f}**. To meet your goal, aim for:

- Maxing out tax-advantaged accounts (401(k), IRA)
- Maintaining a diversified portfolio of stocks and bonds
- Adjusting your savings rate annually

---

### 🛡 Healthcare & Risk

- Plan for at least **$300,000** in lifetime healthcare costs  
- Consider long-term care and supplemental insurance  
- Keep an emergency fund (1–2 years of expenses in retirement)

---

### 🧮 Mortgage

{generate_mortgage_section(user_input)}

---

### 💡 Recommendations

- Increase your savings rate if possible  
- Consider delaying retirement by a few years  
- Rebalance your investment portfolio annually  
- Consider annuities or income products for guaranteed payouts  
- Meet with a retirement advisor every 2–3 years

---

### 📚 Fact-Based Insights

{selected_facts}
"""
    return plan


# ────────────────────────────────────────────────────────────────────────────────
# 8. Generate Retirement Plan
# ────────────────────────────────────────────────────────────────────────────────

def create_retirement_plan(user_input: dict):
    
    formatted_data = format_user_data(user_input)

    json_facts = flatten_facts(load_retirement_facts())
    user_question = "Please generate a personalized retirement plan for this user."
    rag_facts = retrieve_with_rerank(user_question)

    result = build_retirement_plan(user_input, rag_facts)

    return {
        "plan": result,
        "json_facts": json_facts,
        "retrieved_facts": rag_facts,
        "status": "success"
    }

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

    current_age = int(user_input.get('age', 0))
    retirement_age = int(user_input.get('retirementAge', 0))
    savings = float(user_input.get('currentSavings', 0))
    income = float(user_input.get('income', 0))
    annual_contribution = income * 0.15

    years_left = retirement_age - current_age
    projected_savings = savings + (annual_contribution * years_left)

    plan_data = create_retirement_plan(user_input)

    return {
        "years_left": years_left,
        "projected_savings": projected_savings,
        "retirement_plan": plan_data
    }

@router.post("/plan")
async def generate_retirement_plan(user_input: RetirementInput):
    result = calculate_retirement(user_input.model_dump())
    return result

@router.get("/user_profiles")
def get_user_profiles():
    try:
        profiles = load_all_user_profiles()
        return {"profiles": profiles}
    except Exception as e:
        return {"error": str(e)}
