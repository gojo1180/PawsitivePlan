from fastapi import APIRouter, HTTPException, Depends
from typing import List
from supabase import Client
from ..database import get_supabase
from ..dependencies import get_current_user
from ..schemas import TaskCreate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # Retrieve all configured tasks for the active JWT session
        res = db.table("tasks").select("*").eq("user_id", user_id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=TaskResponse)
def create_task(task: TaskCreate, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # We explicitly lock task.user_id to the token's authenticated ID for security
        task_data = task.model_dump()
        task_data['user_id'] = user_id
        res = db.table("tasks").insert(task_data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}/complete")
def complete_task(task_id: str, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # 1. Update task to completed
        task_res = db.table("tasks").update({"is_completed": True}).eq("id", task_id).eq("user_id", user_id).execute()
        if not task_res.data:
            raise HTTPException(status_code=404, detail="Task not found or is unauthorized.")
            
        reward_coins = task_res.data[0].get("reward_coins", 0)
        
        # 2. Grab user profile to process the coins increment
        profile_res = db.table("profiles").select("coins").eq("id", user_id).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        current_coins = profile_res.data[0].get("coins", 0)
        new_coins = current_coins + reward_coins
        
        # 3. Synchronize new balance
        db.table("profiles").update({"coins": new_coins}).eq("id", user_id).execute()
        
        return {"message": "Task completed", "reward": reward_coins, "new_coins_balance": new_coins}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
