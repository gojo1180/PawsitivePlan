import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Login to get token
        login_res = await client.post("http://127.0.0.1:8000/auth/login", json={
            "email": "test_post_task2@gmail.com",
            "password": "Password123!"
        })
        token = login_res.json()["access_token"]

        # 2. Post task exactly like frontend
        payload = {
            "title": "Msl: Mengerjakan jurnal...",
            "reward_coins": 10,
            "is_ai_generated": False,
            "category": "To Do",
            "due_date": None
        }
        task_res = await client.post("http://127.0.0.1:8000/tasks", json=payload, headers={"Authorization": f"Bearer {token}"})
        
        print("MANUAL TASK POST RESULT:", task_res.status_code, task_res.text)

asyncio.run(main())
