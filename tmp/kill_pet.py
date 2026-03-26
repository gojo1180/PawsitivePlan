import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase = create_client(url, key)

res = supabase.table("pets").update({
    "health": 0,
    "hunger": 0,
    "thirst": 0,
    "is_dead": True
}).neq("id", "00000000-0000-0000-0000-000000000000").execute()

print(f"Killed {len(res.data)} pets for testing.")
