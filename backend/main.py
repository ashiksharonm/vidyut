from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pydantic import BaseModel

from simulation import grid_sim
from ai_agent import agent

app = FastAPI(title="Vidyut Microgrid AI Backend")

# Allow CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OverrideRequest(BaseModel):
    cloud_cover: float

@app.on_event("startup")
async def startup_event():
    # Start the simulation loop in the background
    asyncio.create_task(simulation_loop())

async def simulation_loop():
    """Background task to update simulation state and run AI agent."""
    while True:
        # Simulate 1 tick
        grid_sim.update_state()
        # AI evaluates the new state
        agent.evaluate_grid()
        
        # Run every 2 seconds for demo purposes
        await asyncio.sleep(2)

@app.get("/api/state")
async def get_state():
    """Returns the current state of the microgrid."""
    return grid_sim.get_state()

@app.get("/api/logs")
async def get_logs():
    """Returns the explainable AI action logs from the database."""
    from database import get_db_connection
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM ai_logs ORDER BY id DESC LIMIT 20")
    rows = c.fetchall()
    conn.close()
    
    logs = [dict(row) for row in rows]
    return {"logs": logs}

@app.post("/api/override/weather")
async def override_weather(req: OverrideRequest):
    """
    Endpoint for manual hackathon demonstration. 
    Allows setting the cloud cover to force the AI to react.
    1.0 = Sunny, 0.0 = Heavy Clouds
    """
    grid_sim.cloud_cover_modifier = req.cloud_cover
    agent.log_action(f"Manual Override: Weather cloud cover modifier set to {req.cloud_cover}", "Alert")
    return {"status": "success", "cloud_cover": grid_sim.cloud_cover_modifier}

@app.post("/api/override/battery")
async def override_battery(level: float):
    """Override battery level for testing."""
    grid_sim.battery_level = level
    agent.log_action(f"Manual Override: Battery level forced to {level}%", "Alert")
    return {"status": "success", "battery_level": grid_sim.battery_level}
