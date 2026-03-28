from fastapi import APIRouter, HTTPException, Depends
from typing import Any
from supabase import Client
from datetime import datetime, timezone
import math
from ..database import get_supabase
from ..dependencies import get_current_user

router = APIRouter(prefix="/pets", tags=["Pets"])

@router.get("/me")
def get_my_pet(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # 1. Get the individual user pet
        pet_res = db.table("pets").select("*").eq("user_id", user_id).execute()
        
        # AUTO HEALING: Jika user dibuat manual di Supabase Auth (tidak via register API),
        # mereka tidak punya pet & profile, jadi otomatis kita buatkan agar tidak dilempar 404!
        if not pet_res.data:
            import httpx
            from ..database import SUPABASE_URL, SUPABASE_KEY
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            # Auto-create profile
            httpx.post(f"{SUPABASE_URL}/rest/v1/profiles", headers=headers, json={
                "id": user_id,
                "username": "Pemain Manual",
                "coins": 0
            })
            # Auto-create pet
            httpx.post(f"{SUPABASE_URL}/rest/v1/pets", headers=headers, json={
                "user_id": user_id,
                "name": "Kucing Sakti",
                "species": "kucing",
                "level": 1,
                "experience": 0
            })
            # Fetch ulang setelah auto-heal
            pet_res = db.table("pets").select("*").eq("user_id", user_id).execute()
            if not pet_res.data:
                raise HTTPException(status_code=404, detail="Masih gagal membuat pet auto-heal")
                
        pet = pet_res.data[0]

        # Calculate Tamagotchi Survival Drain
        if not pet.get("is_dead") and pet.get("last_updated"):
            try:
                last_updated = datetime.fromisoformat(pet["last_updated"])
                now = datetime.now(timezone.utc)
                diff = now - last_updated
                minutes_passed = diff.total_seconds() / 60.0

                if minutes_passed >= 5: # Drain occurs every 5 minutes
                    cycles = math.floor(minutes_passed / 5)
                    new_hunger = max(0, pet.get("hunger", 100) - cycles * 2)
                    new_thirst = max(0, pet.get("thirst", 100) - cycles * 3)
                    new_health = pet.get("health", 100)
                    
                    if new_hunger == 0 or new_thirst == 0:
                        starve_cycles = cycles
                        new_health = max(0, new_health - starve_cycles * 5)
                    
                    is_dead = new_health == 0
                    update_data = {
                        "hunger": new_hunger,
                        "thirst": new_thirst,
                        "health": new_health,
                        "is_dead": is_dead,
                        "last_updated": now.isoformat()
                    }
                    if is_dead:
                        update_data["level"] = 1
                        update_data["experience"] = 0
                        
                    db.table("pets").update(update_data).eq("id", pet["id"]).execute()
                    pet.update(update_data)
            except Exception as e:
                print(f"Error calculating drain: {e}")
                pass
        elif not pet.get("last_updated"):
            now = datetime.now(timezone.utc).isoformat()
            db.table("pets").update({"last_updated": now, "health": 100, "hunger": 100, "thirst": 100}).eq("id", pet["id"]).execute()
            pet["last_updated"] = now
            pet["health"] = 100; pet["hunger"] = 100; pet["thirst"] = 100

        # 2. Hydrate all inventory items
        # Join to shop_items to give frontend all the context needed for rendering (urls/names)
        inv_res = db.table("user_inventory").select("*, shop_items(*)").eq("user_id", user_id).execute()
        
        # 3. Get profile
        profile_res = db.table("profiles").select("*").eq("id", user_id).execute()
        profile = profile_res.data[0] if profile_res.data else {}
        
        return {
            "pet": pet,
            "profile": profile,
            "inventory": inv_res.data
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

@router.post("/feed/{inventory_id}")
def feed_pet(inventory_id: str, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        inv_res = db.table("user_inventory").select("*, shop_items(*)").eq("id", inventory_id).eq("user_id", user_id).execute()
        if not inv_res.data:
            raise HTTPException(status_code=404, detail="Item not found in your inventory")
            
        inv_item = inv_res.data[0]
        shop_item = inv_item.get("shop_items", {})
        item_type = shop_item.get("type", "")
        
        if item_type not in ["food", "water", "consumable"]:
            raise HTTPException(status_code=400, detail="This item is not consumable.")
            
        new_quantity = inv_item["quantity"] - 1
        if new_quantity <= 0:
            db.table("user_inventory").delete().eq("id", inventory_id).execute()
        else:
            db.table("user_inventory").update({"quantity": new_quantity}).eq("id", inventory_id).execute()
            
        pet_res = db.table("pets").select("*").eq("user_id", user_id).execute()
        if not pet_res.data:
            raise HTTPException(status_code=404, detail="Pet not found")
            
        pet = pet_res.data[0]
        if pet.get("is_dead"):
            raise HTTPException(status_code=400, detail="Peliharaan kamu sudah tiada. Tidak bisa makan lagi.")
            
        now = datetime.now(timezone.utc).isoformat()
        update_data: dict[str, Any] = {"last_updated": now}
        
        if item_type == "food" or item_type == "consumable":
            update_data["hunger"] = min(100, pet.get("hunger", 100) + 30)
            update_data["health"] = min(100, pet.get("health", 100) + 5)
        elif item_type == "water":
            update_data["thirst"] = min(100, pet.get("thirst", 100) + 40)
            update_data["health"] = min(100, pet.get("health", 100) + 5)
            
        db.table("pets").update(update_data).eq("id", pet["id"]).execute()
        
        return {"message": f"Berhasil memberikan {shop_item.get('name')} kepada peliharaanmu", "pet_stats": update_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/revive")
def revive_pet(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        profile_res = db.table("profiles").select("coins").eq("id", user_id).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        coins = profile_res.data[0]["coins"]
        REVIVE_COST = 100
        if coins < REVIVE_COST:
            raise HTTPException(status_code=400, detail=f"Koin tidak cukup. Butuh {REVIVE_COST} koin untuk menghidupkan.")
            
        # Deduct coins
        db.table("profiles").update({"coins": coins - REVIVE_COST}).eq("id", user_id).execute()
        
        # Reset pet stats
        now = datetime.now(timezone.utc).isoformat()
        update_data = {
            "health": 100,
            "hunger": 100,
            "thirst": 100,
            "is_dead": False,
            "last_updated": now
        }
        db.table("pets").update(update_data).eq("user_id", user_id).execute()
        
        return {"message": "Peliharaan berhasil dihidupkan!", "pet_stats": update_data, "coins_deducted": REVIVE_COST}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
