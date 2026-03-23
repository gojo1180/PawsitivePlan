# 🐾 PawsitivePlan

**PawsitivePlan** adalah aplikasi produktivitas gamified yang mengajak kamu untuk menyelesaikan tugas sehari-hari sambil merawat hewan peliharaan virtual. Semakin banyak tugas yang kamu selesaikan, semakin berkembang peliharaanmu!

---

## ✨ Fitur Utama

- 🤖 **AI Quest Generator** — Masukkan goals kamu dan biarkan AI memecahnya menjadi langkah-langkah tugas yang actionable.
- 🐱 **Virtual Pet** — Hewan peliharaan virtual yang tumbuh seiring produktivitasmu menggunakan XP dan Koin.
- 📋 **Custom Kanban Board** — Buat papan Kanban sesukamu (Daily Quest, Event, Tugas Kuliah, dll.) dengan drag-and-drop.
- 🗓️ **Jadwal & Deadline** — Set tanggal target untuk setiap tugas agar tidak ada yang terlewat.
- 🏆 **Reward System** — Setiap tugas yang selesai memberikan koin yang bisa ditukarkan di Toko Hadiah.
- 🛍️ **Item Shop** — Beli aksesoris bagi peliharaanmu menggunakan koin yang kamu kumpulkan.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python)
- **Supabase** (Auth + Database)
- **Google Gemini API** (AI Task Generation)
- **Uvicorn** (ASGI Server)

### Frontend
- **Next.js 14** (React Framework)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **@hello-pangea/dnd** (Drag and Drop)

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Python 3.10+
- Node.js 18+
- Akun Supabase

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Buat file `.env` di folder `backend/` dengan isi:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Jalankan server:
```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Akses aplikasi di: `http://localhost:3000`

---

## 📐 Struktur Database (Supabase)

```sql
-- Tabel Profiles (linked ke auth.users)
profiles (id uuid, username text, coins int4, board_columns text[], created_at timestamptz)

-- Tabel Pets
pets (id uuid, user_id uuid, name text, species text, level int4, experience int4, created_at timestamptz)

-- Tabel Tasks
tasks (id uuid, user_id uuid, title text, is_completed bool, is_ai_generated bool,
       reward_coins int4, category text, order_index numeric, due_date timestamptz, created_at timestamptz)

-- Tabel Shop Items
shop_items (id uuid, name text, type text, price int4, image_url text)

-- Tabel User Inventory
user_inventory (id uuid, user_id uuid, item_id uuid, quantity int4, is_equipped bool)
```

---

## 👨‍💻 Tim

Dibuat dengan ❤️ untuk Lomba Hackathon 2026.
