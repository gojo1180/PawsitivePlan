from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..database import get_supabase
from ..dependencies import get_current_user

router = APIRouter(prefix="/pets", tags=["Pets"])

@router.get("/me")
def get_my_pet(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # 1. Get the individual user pet
        pet_res = db.table("pets").select("*").eq("user_id", user_id).execute()
        if not pet_res.data:
            raise HTTPException(status_code=404, detail="Pet data not initialized for this user")
        pet = pet_res.data[0]

        # 2. Hydrate equipped items
        # Join to shop_items to give frontend all the context needed for rendering (urls/names)
        inv_res = db.table("user_inventory").select("*, shop_items(*)").eq("user_id", user_id).eq("is_equipped", True).execute()
        
        # 3. Get profile
        profile_res = db.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_res.data[0] if profile_res.data else {}
        
        return {
            "pet": pet,
            "profile": profile,
            "equipped_items": inv_res.data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/equip/{inventory_id}")
def equip_item(inventory_id: str, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # 1. Flip toggle switch based on what the frontend gives -> back to DB
        inv_res = db.table("user_inventory").select("is_equipped").eq("id", inventory_id).eq("user_id", user_id).execute()
        if not inv_res.data:
            raise HTTPException(status_code=404, detail="Item not found in your inventory")
            
        current_status = inv_res.data[0]["is_equipped"]
        new_status = not current_status
        
        # 2. Push Update
        db.table("user_inventory").update({"is_equipped": new_status}).eq("id", inventory_id).execute()
        
        return {"message": "Equipment visibility toggled successfully", "is_equipped": new_status}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
