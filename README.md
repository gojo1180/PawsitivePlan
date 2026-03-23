# PawsitivePlan 🐾

PawsitivePlan is a gamified productivity web application designed to make task management fun, engaging, and rewarding.

## 🚀 Features
- **Gamified Task Management**: Turn your daily goals into manageable, rewarding tasks.
- **Virtual Pet System**: Adopt, care for, and customize your virtual companion.
- **Reward System**: Earn coins by completing tasks to purchase items for your pet.
- **AI Task Generation**: Get AI-assisted breakdowns and suggestions for your goals.

## 🛠️ Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI, Python

## 📂 Project Structure
- `frontend/`: The Next.js frontend application.
- `backend/`: The FastAPI backend service.

## 🚀 Getting Started

### Prerequisites
- Node.js (for frontend)
- Python 3.x (for backend)

### Installation
**1. Clone the repository**
```bash
git clone https://github.com/gojo1180/PawsitivePlan.git
cd PawsitivePlan
```

**2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

**3. Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload
```
