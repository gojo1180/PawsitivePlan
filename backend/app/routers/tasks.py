from fastapi import APIRouter, HTTPException, Depends
from typing import List
from supabase import Client
from ..database import get_supabase
from ..dependencies import get_current_user
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from pydantic import BaseModel

router = APIRouter(prefix="/tasks", tags=["Tasks"])

import datetime

@router.get("", response_model=List[TaskResponse])
def get_tasks(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # Retrieve all configured tasks for the active JWT session
        res = db.table("tasks").select("*").eq("user_id", user_id).execute()
        tasks = res.data

        # Reset daily quests if completed on a previous day
        today = datetime.datetime.now(datetime.timezone.utc).date()
        for task in tasks:
            if task.get("category") == "Daily Quest" and task.get("is_completed"):
                last_completed_str = task.get("last_completed_at")
                if last_completed_str:
                    try:
                        last_completed_dt = datetime.datetime.fromisoformat(last_completed_str.replace("Z", "+00:00"))
                        if last_completed_dt.date() < today:
                            # Reset in DB
                            db.table("tasks").update({
                                "is_completed": False, 
                                "last_completed_at": None,
                                "category": "Daily Quest"
                            }).eq("id", task["id"]).execute()
                            
                            # Also reflect in returned memory object
                            task["is_completed"] = False
                            task["last_completed_at"] = None
                    except ValueError:
                        pass
                        
        return tasks
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=TaskResponse)
def create_task(task: TaskCreate, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # We explicitly lock task.user_id to the token's authenticated ID for security
        task_data = task.model_dump(mode="json")
        task_data['user_id'] = user_id
        res = db.table("tasks").insert(task_data).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}/complete")
def complete_task(task_id: str, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # 1. Update task to completed and log timestamp
        task_res = db.table("tasks").update({
            "is_completed": True,
            "last_completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }).eq("id", task_id).eq("user_id", user_id).execute()
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

@router.delete("/{task_id}")
def delete_task(task_id: str, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        res = db.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Task not found or is unauthorized.")
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/clear/completed")
def clear_completed_tasks(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        res = db.table("tasks").delete().eq("user_id", user_id).eq("is_completed", True).execute()
        return {"message": "Completed tasks cleared", "deleted_count": len(res.data) if res.data else 0}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{task_id}")
def update_task_generic(task_id: str, task: TaskUpdate, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        update_data = task.model_dump(exclude_unset=True, mode="json")
        if not update_data:
            return {"message": "No items to update"}
        res = db.table("tasks").update(update_data).eq("id", task_id).eq("user_id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Task not found or unauthorized")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

