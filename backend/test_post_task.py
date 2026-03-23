import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Login to get token
        login_res = await client.post("http://127.0.0.1:8000/auth/login", json={
            "email": "test_post_task2@gmail.com",
            "password": "Password123!"
        })
        if login_res.status_code == 404 or login_res.status_code >= 400:
            # Register
            await client.post("http://127.0.0.1:8000/auth/register", json={
                "email": "test_post_task2@gmail.com",
                "password": "Password123!",
                "username": "testerpost",
                "species": "kucing"
            })
            login_res = await client.post("http://127.0.0.1:8000/auth/login", json={
                "email": "test_post_task2@gmail.com",
                "password": "Password123!"
            })
        
        try:
            token = login_res.json()["access_token"]
        except Exception as e:
            print("LOGIN FAILED:", login_res.text)
            return

        # 2. Post task
        task_res = await client.post("http://127.0.0.1:8000/tasks", json={
            "title": "Selesaikan membaca buku ke-9",
            "reward_coins": 25,
            "category": "To Do",
            "is_ai_generated": True
        }, headers={"Authorization": f"Bearer {token}"})
        
        print("TASK POST RESULT:", task_res.status_code, task_res.text)

asyncio.run(main())
