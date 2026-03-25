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
def buy_item(item_id: str, quantity: int = 1, user_id: str = Depends(get_current_user), db: Client = Depends(get_supabase)):
    try:
        item_res = db.table("shop_items").select("price, type").eq("id", item_id).execute()
        if not item_res.data:
            raise HTTPException(status_code=404, detail="Item not found")
        item_data = item_res.data[0]
        price = item_data.get("price", 0)
        item_type = item_data.get("type", "")

        # 1.5 Handle Quantity and Type Logic
        if item_type in ["face", "head"]:
            # Check if user already owns this cosmetic
            owned_res = db.table("user_inventory").select("id").eq("user_id", user_id).eq("item_id", item_id).execute()
            if owned_res.data:
                raise HTTPException(status_code=400, detail="You already own this cosmetic item!")
            quantity = 1 # Force quantity 1 for cosmetics
        
        if quantity < 1:
            raise HTTPException(status_code=400, detail="Quantity must be at least 1")

        total_price = price * quantity

        # 2. Authorize Purchase Affordability
        profile_res = db.table("profiles").select("coins").eq("id", user_id).execute()
        if not profile_res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        current_coins = profile_res.data[0].get("coins", 0)

        if current_coins < total_price:
            raise HTTPException(status_code=400, detail="Insufficient coins to make this purchase")

        # 3. Deduct Currency From User
        new_coins = current_coins - total_price
        db.table("profiles").update({"coins": new_coins}).eq("id", user_id).execute()

        # 4. Give the user the inventory item appropriately (inserting/updating quantity array)
        inv_res = db.table("user_inventory").select("id", "quantity").eq("user_id", user_id).eq("item_id", item_id).execute()
        if inv_res.data:
            # We already have at least 1, iterate
            new_quantity = inv_res.data[0]["quantity"] + quantity
            db.table("user_inventory").update({"quantity": new_quantity}).eq("id", inv_res.data[0]["id"]).execute()
        else:
            # First time purchasing
            db.table("user_inventory").insert({
                "user_id": user_id,
                "item_id": item_id,
                "quantity": quantity,
                "is_equipped": False
            }).execute()

        return {"message": "Success! Item added to inventory.", "remaining_coins": new_coins}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
