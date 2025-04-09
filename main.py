# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules import retirement_planner

app = FastAPI(
    title="AI Retirement Planner",
    description="Backend API for generating personalized retirement plans using RAG and structured data",
    version="1.0.0"
)

# Enable CORS for your React frontend (default: http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update if you deploy elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
retirement_planner.process_retirement_text("data/retirement_facts.txt")
# Include your planner route
app.include_router(retirement_planner.router)

# # Optional health check
# @app.get("/health")
# def health_check():
#     return {"status": "ok"}
