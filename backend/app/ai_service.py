import os
import json
import google.generativeai as genai
from typing import List
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_tasks_for_goal(goal: str) -> List[dict]:
    """
    Uses Gemini LLM to generate a structured To-Do list for a given goal.
    Returns a list of dictionaries containing 'title' and 'reward_coins'.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set. Check environment variables.")

    # We use gemini-1.5-flash and configure it to strictly return JSON
    model = genai.GenerativeModel(
        "gemini-3-flash-preview",
        generation_config={"response_mime_type": "application/json"}
    )

    prompt = f"""
    You are an AI productivity assistant. A user wants to achieve the following goal:
    "{goal}"

    Break this goal down into a practical, actionable To-Do list.
    Return a JSON array of objects. Each object must have exactly two fields:
    - "title": A string describing the task.
    - "reward_coins": An integer between 10 and 30, based on the difficulty of the task.

    Only return the JSON array, no other text.
    """

    try:
        response = model.generate_content(prompt)
        
        # Parse the JSON response securely
        tasks = json.loads(response.text)
        
        # Validate that the model actually gave us a list
        if not isinstance(tasks, list):
            raise ValueError("Expected a JSON array from LLM.")
            
        validated_tasks = []
        for task in tasks:
            title = task.get("title", "Generated Task")
            
            try:
                coins = int(task.get("reward_coins", 10))
            except ValueError:
                coins = 10
                
            # Clamp reward_coins strictly between 10 and 30
            coins = max(10, min(30, coins))
            
            validated_tasks.append({
                "title": str(title),
                "reward_coins": coins
            })
            
        return validated_tasks
    except Exception as e:
        print(f"Error generating tasks: {str(e)}")
        # Provide fallback values so the client always gets a reasonable error gracefully handling
        return [
            {"title": f"Take the first step towards: {goal}", "reward_coins": 15},
            {"title": "Research best practices", "reward_coins": 10}
        ]
