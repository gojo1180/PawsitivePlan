import asyncio
import httpx
from app.database import SUPABASE_URL, SUPABASE_KEY

async def main():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    async with httpx.AsyncClient() as client:
        # Check tasks table
        res = await client.get(f"{SUPABASE_URL}/rest/v1/tasks?limit=1", headers=headers)
        if res.status_code == 200 and res.json():
            print("TASKS ROW:", res.json()[0])
        else:
            print("TASKS ERROR/EMPTY:", res.text)
            
        res2 = await client.get(f"{SUPABASE_URL}/rest/v1/profiles?limit=1", headers=headers)
        if res2.status_code == 200 and res2.json():
            print("PROFILES ROW:", res2.json()[0])

asyncio.run(main())
