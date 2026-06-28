
# RideCast - AI Ride Demand Prediction Platform

A professional, enterprise-grade AI-powered ride demand prediction platform with modern UI and FastAPI backend.

## Features

- 🔐 User authentication system
- 📊 Real-time dashboard with animated charts and KPIs
- 🗺️ Interactive city demand heatmap
- 🤖 AI demand prediction with real weather, time, and holiday data
- 📦 Batch prediction support
- 📜 Prediction history with filtering
- 📈 Analytics dashboard with trends and insights
- 🔔 Notifications and alerts
- 🎨 Theme selection (Dark, Light, Midnight, System)
- 🎯 Accent color customization
- ⚙️ Settings and configuration

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (charts)
- React Router (routing)
- Context API (state management)

### Backend
- FastAPI (API framework)
- SQLAlchemy (database ORM)
- SQLite (default database, PostgreSQL optional)
- Scikit-learn (ML models)
- Pydantic (data validation)
- CORS middleware (cross-origin requests)
- Random Forest ML model for demand prediction

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenWeatherMap API key (free tier available)

### 1. Frontend Setup

#### Install dependencies
```bash
npm install
```

#### Create .env file
Copy .env.example to .env and add your OpenWeatherMap API key
```bash
cp .env.example .env
```
Edit .env and set:
```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:8000
```

#### Run frontend development server
```bash
npm run dev
```
Frontend will be available at http://localhost:5175/ or http://localhost:5173/

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### (Optional) Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### (Optional) Configure PostgreSQL
By default, the app uses SQLite. To use PostgreSQL, create a .env file in backend/ directory:
```env
DATABASE_URL=postgresql://user:password@localhost/ridecast
```

#### Run backend development server
```bash
uvicorn main:app --reload --port 8000
```
Backend will be available at http://localhost:8000/
API documentation (Swagger UI) at http://localhost:8000/docs

The first time you run the backend, it will automatically:
1. Create the database and tables
2. Train a Random Forest ML model with synthetic data
3. Save the model for future use

## Usage

### Running the App
1. Start backend server first (port 8000)
2. Start frontend server
3. Open your browser at the frontend URL
4. Sign up or log in
5. Explore the app!

### Predicting Demand
1. Go to "Prediction" page
2. Enter a city name (e.g., New York, London, Tokyo)
3. Click "Predict"
4. Wait for real weather data, holiday check, and backend prediction
5. View detailed results including demand score, surge multiplier, and recommended drivers

### Viewing History
1. Go to "History" page
2. Browse all past predictions
3. Filter by city, date, or search term
4. View key statistics at a glance

### Analytics
1. Go to "Analytics" page
2. View hourly demand trends
3. Check weekly demand patterns
4. See weather impact on demand

## Project Structure

```
RideCast/
├── src/                  # Frontend code
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context (auth, theme, notifications)
│   ├── pages/            # App pages
│   ├── services/         # API service layer
│   └── App.tsx           # Main app component
├── backend/              # FastAPI backend
│   ├── main.py           # Backend app and API endpoints
│   ├── database.py       # Database models and setup
│   ├── ml_model.py       # ML model training and prediction
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Example backend env vars
├── .env                  # Frontend env vars
├── .env.example          # Example env vars
└── README.md             # This file!
```

## API Endpoints

### Backend (FastAPI)
- `GET /` - Welcome message
- `POST /predict` - Get demand prediction
  - Input: `city`, `temperature`, `weather`, `local_time`, `holiday`, `weekend`
  - Output: `demand_score`, `demand_category`, `surge_multiplier`, `recommended_drivers`, `revenue_estimate`, `explanation`
- `GET /history` - Get all prediction history
- `GET /analytics` - Get analytics data for dashboard
- API docs: http://localhost:8000/docs

## Deployment

### Frontend (Vercel)

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. In the project settings:
   - Add Environment Variable `VITE_OPENWEATHER_API_KEY` (your OpenWeatherMap key)
   - Add Environment Variable `VITE_API_URL` (your Render backend URL, e.g., `https://your-render-app.onrender.com`)
5. Click "Deploy"
6. Your frontend will be live!

### Backend (Render)

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Go to [render.com](https://render.com) and sign in
3. Click "New" → "Web Service"
4. Import your repository
5. Configure the web service:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
6. Add Environment Variables if needed (e.g., `DATABASE_URL` for PostgreSQL)
7. Click "Create Web Service"
8. Your backend will be live!

## Notes

- Backend uses Random Forest ML model trained on synthetic data
- All predictions are automatically saved to the database
- Frontend uses safe fetch with mock data fallbacks if backend is unavailable
- Frontend uses OpenStreetMap, OpenWeatherMap, and Nager.Date APIs for data gathering
- If backend isn't running, the app will fall back to mock data
- Theme and accent color preferences are saved in localStorage

## License

MIT License (feel free to use and modify!)
