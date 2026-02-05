# MedTranslate

A Healthcare Doctor–Patient Translation Web Application.

## Project Structure

- **frontend/**: React + Vite application.
- **backend/**: FastAPI + MongoDB (GridFS) + Google Gemini application.

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB Atlas URI
- Google Gemini API Key

### Backend Setup

21. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
22. Create and activate a virtual environment (optional).
23. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
24. Configure `.env` (see `.env.example`).
25. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
4.  Configure environment variables:
    - Create `frontend/.env` from `frontend/.env.example`.
    - Set `VITE_API_BASE_URL=http://localhost:8000` for local development.
    - For production (Vercel), set `VITE_API_BASE_URL` to your deployed backend URL.
    - If `VITE_API_BASE_URL` is empty, requests will fail (unless you rely on proxy and empty string fallback, currently strictly typed).

5.  Run the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

### Running Tests

To verify the backend API:
```bash
python backend/test_backend.py
```
