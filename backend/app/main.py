from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from .schemas import GoalRequest, AITaskItem
from .ai_service import generate_tasks_for_goal

from .routers import auth, tasks, shop, pets

app = FastAPI(title="Gamified Productivity API", version="1.0.0")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Add production URLs later
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Gamified Productivity API!"}

@app.post("/api/generate-tasks", response_model=List[AITaskItem])
def generate_tasks(request: GoalRequest):
    """
    Receives a user's goal, calls the Gemini LLM service, and returns 
    a structured array of tasks that the frontend can preview.
    """
    try:
        # Generate tasks using our LLM wrapper
        generated_tasks = generate_tasks_for_goal(request.goal)
        return generated_tasks
    except ValueError as val_err:
        # Handle issues with Environment Variables or explicitly thrown value errors
        raise HTTPException(status_code=500, detail=str(val_err))
    except Exception as e:
        # Handle general server errors
        raise HTTPException(status_code=500, detail="Failed to initialize or process AI generate tasks")

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(shop.router)
app.include_router(pets.router)
