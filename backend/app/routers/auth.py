from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from ..database import get_supabase
from ..schemas import UserRegister, UserLogin

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user_data: UserRegister, db: Client = Depends(get_supabase)):
    try:
        # 1. Sign up user via Supabase Auth
        auth_res = db.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        user_id = auth_res.user.id
        
        import httpx
        from ..database import SUPABASE_URL, SUPABASE_KEY
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # 2. Insert into profiles table via REST to bypass Python SDK session injection
        prof_res = httpx.post(f"{SUPABASE_URL}/rest/v1/profiles", headers=headers, json={
            "id": user_id,
            "username": user_data.username,
            "coins": 0
        })
        
        # If conflict, it means a Supabase trigger already created it, so we patch instead
        if prof_res.status_code == 409:
            httpx.patch(f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}", headers=headers, json={
                "username": user_data.username
            })
        elif prof_res.status_code >= 400:
            raise Exception(f"Profile error: {prof_res.text}")
        
        # 3. Create initial pet
        pet_res = httpx.post(f"{SUPABASE_URL}/rest/v1/pets", headers=headers, json={
            "user_id": user_id,
            "name": f"{user_data.username}'s Pet",
            "species": user_data.species,
            "level": 1,
            "experience": 0
        })
        if pet_res.status_code >= 400:
            pass # Ignore if trigger created it, though unlikely for pets
            
        return {"message": "User registered successfully", "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(user_data: UserLogin, db: Client = Depends(get_supabase)):
    try:
        auth_res = db.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        # Note: In a production app you may want to parse this into a model
        return {"access_token": auth_res.session.access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")
