# Vidyut: AI-Powered Rural Microgrid Manager

Vidyut is an autonomous, predictive AI agent designed to optimize decentralized solar microgrids in rural India. Built for the **India AI Impact Fest 2026**, it shifts grid management from a reactive approach (waiting for blackouts) to a proactive one (predicting outages and gracefully shedding non-essential loads).

## 🚀 The Problem & Solution

**Problem:** Rural solar microgrids suffer from massive inefficiencies. When agricultural loads (like water pumps) operate during cloudy periods, batteries drain rapidly. The system trips, plunging essential services (like healthcare centers) into sudden blackouts, and deep-discharging expensive batteries.

**Solution:** Vidyut uses a **Predictive AI Agent** connected to live meteorological data (Open-Meteo). By forecasting solar irradiance and analyzing battery telemetry, it autonomously sheds "non-essential" loads before outages occur, ensuring 24/7 power for critical infrastructure.

## 💡 Key Features & Novelty

1. **Predictive Grid Management:** Unlike traditional reactive grids, Vidyut looks into the future. It uses live weather data to predict generation drops and acts proactively.
2. **Explainable AI (XAI):** Black-box AI breeds distrust. Vidyut features a transparent AI Action Log that explains *exactly why* it cut power (e.g., "Shedding non-essential load due to predicted 2-hour heavy cloud cover").
3. **Inclusivity & Vernacular UX:** The premium glassmorphism dashboard features a seamless English/Hindi toggle and simple visual indicators (Red/Yellow/Green), empowering non-technical rural cooperative managers.

## 🛠️ Tech Stack

*   **Backend:** Python, FastAPI, SQLite (Persistent Time-Series & XAI Logging)
*   **AI Logic:** Autonomous agent architecture with Open-Meteo API integration
*   **Frontend:** React, Vite, Recharts (Premium Dark Mode UI)

## 💻 How to Run Locally

### 1. Start the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*The backend will automatically generate the SQLite database (`vidyut.db`) on startup.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. View Dashboard
Navigate to `http://localhost:5173` to view the live dashboard and interact with the AI agent.

## 🌍 Sustainable Development Goals (SDGs)
*   **SDG 7:** Affordable and Clean Energy
*   **SDG 11:** Sustainable Cities and Communities
