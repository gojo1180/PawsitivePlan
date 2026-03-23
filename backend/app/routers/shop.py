from fastapi import APIRouter, HTTPException, Depends
from typing import List
from supabase import Client
from ..database import get_supabase
from ..dependencies import get_current_user
from ..schemas import ShopItemResponse

router = APIRouter(prefix="/shop", tags=["Shop"])

@router.get("", response_model=List[ShopItemResponse])
def get_shop_items(db: Client = Depends(get_supabase)):
    try:
        res = db.table("shop_items").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inventory")
def get_user_inventory(user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        inv_res = db.table("user_inventory").select("*, shop_items(*)").eq("user_id", user_id).execute()
        return inv_res.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/buy/{item_id}")
def buy_item(item_id: str, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        # 1. Check Shop Item Price
        item_res = db.table("shop_items").select("price").eq("id", item_id).execute()
        if not item_res.data:
            raise HTTPException(status_code=404, detail="Item not found")
        price = item_res.data[0].get("price", 0)

        # 2. Authorize Purchase Affordability
        profile_res = db.table("profiles").select("coins").eq("id", user_id).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        current_coins = profile_res.data[0].get("coins", 0)

        if current_coins < price:
            raise HTTPException(status_code=400, detail="Insufficient coins to make this purchase")

        # 3. Deduct Currency From User
        new_coins = current_coins - price
        db.table("profiles").update({"coins": new_coins}).eq("id", user_id).execute()

        # 4. Give the user the inventory item appropriately (inserting/updating quantity array)
        inv_res = db.table("user_inventory").select("id", "quantity").eq("user_id", user_id).eq("item_id", item_id).execute()
        if inv_res.data:
            # We already have at least 1, iterate
            new_quantity = inv_res.data[0]["quantity"] + 1
            db.table("user_inventory").update({"quantity": new_quantity}).eq("id", inv_res.data[0]["id"]).execute()
        else:
            # First time purchasing
            db.table("user_inventory").insert({
                "user_id": user_id,
                "item_id": item_id,
                "quantity": 1,
                "is_equipped": False
            }).execute()

        return {"message": "Success! Item added to inventory.", "remaining_coins": new_coins}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
