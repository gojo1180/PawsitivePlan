import asyncio
import httpx
from app.database import SUPABASE_URL, SUPABASE_KEY

async def main():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Payload for the new cosmetic item
    new_item = {
        "name": "Kacamata Hitam",
        "type": "face",
        "price": 100,
        "image_url": "/asset/kosmetik/black_glasses.png"
    }

    async with httpx.AsyncClient() as client:
        # Check if it already exists
        check_res = await client.get(f"{SUPABASE_URL}/rest/v1/shop_items?image_url=eq./asset/kosmetik/black_glasses.png", headers=headers)
        if len(check_res.json()) == 0:
            insert_res = await client.post(f"{SUPABASE_URL}/rest/v1/shop_items", json=new_item, headers=headers)
            print("INSERT RESULT:", insert_res.status_code, insert_res.text)
        else:
            print("Item already exists!")

asyncio.run(main())
