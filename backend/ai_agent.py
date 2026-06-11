import requests
from typing import Dict, Any
from simulation import grid_sim

class VidyutAIAgent:
    def __init__(self):
        # Jaipur, Rajasthan coordinates for high solar potential
        self.lat = 26.9124
        self.lon = 75.7873
        self.action_log = []
        
    def fetch_weather_forecast(self) -> float:
        """
        Fetches real-time cloud cover from open-meteo API.
        Returns a modifier from 0.0 to 1.0 (1.0 = clear sky, 0.0 = total cloud cover)
        """
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={self.lat}&longitude={self.lon}&current=cloud_cover"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                cloud_cover_percent = data['current']['cloud_cover']
                # Inverse relationship: 100% cloud cover = 0.2 modifier (some ambient light remains)
                modifier = max(0.2, 1.0 - (cloud_cover_percent / 100.0))
                return modifier
        except Exception as e:
            self.log_action(f"Error fetching weather data: {str(e)}. Defaulting to clear sky.")
        
        return 1.0 # Default to sunny if API fails

    def log_action(self, message: str, action_type: str = "Info"):
        """Logs explainable actions taken by the AI for transparency."""
        import time
        from database import get_db_connection
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("INSERT INTO ai_logs (timestamp, message, type) VALUES (?, ?, ?)", 
                  (time.time(), message, action_type))
        conn.commit()
        
        # Keep only the last 50 logs to prevent db bloat for this prototype
        c.execute("DELETE FROM ai_logs WHERE id NOT IN (SELECT id FROM ai_logs ORDER BY id DESC LIMIT 50)")
        conn.commit()
        conn.close()

    def evaluate_grid(self):
        """
        The core intelligence of the agent. Evaluates state and predicts shortfalls.
        """
        state = grid_sim.get_state()
        battery = state['battery_level']
        solar = state['solar_generation_kw']
        total_load = state['essential_load_kw'] + (state['non_essential_load_kw'] if state['is_non_essential_connected'] else 0)
        
        # 1. Update weather modifier
        cloud_modifier = self.fetch_weather_forecast()
        
        # We can add artificial simulation overrides here if needed, but we'll use real data by default.
        # If the user wants to test, we can allow overriding this via an API endpoint.
        # For now, let's just use the real data but allow the simulation to override it if set manually.
        if grid_sim.cloud_cover_modifier != cloud_modifier and grid_sim.cloud_cover_modifier == 1.0:
            # Only update if the simulation hasn't been manually overridden
            grid_sim.cloud_cover_modifier = cloud_modifier

        # 2. Predictive Load Shedding Logic
        # If battery is critical (< 30%) and load > generation
        if battery < 30.0 and total_load > solar:
            if state['is_non_essential_connected']:
                grid_sim.is_non_essential_connected = False
                self.log_action(
                    f"Battery critical ({battery}%). Solar generation ({solar}kW) is insufficient for current demand ({total_load}kW). Shedding non-essential agricultural load to protect essential services.",
                    "Action"
                )
        
        # If battery is warning (< 50%) and heavy clouds are present
        elif battery < 50.0 and cloud_modifier < 0.5:
            if state['is_non_essential_connected']:
                grid_sim.is_non_essential_connected = False
                self.log_action(
                    f"Weather Prediction Alert: Heavy cloud cover detected. Battery at {battery}%. Proactively shedding non-essential loads to conserve power for the night.",
                    "Action"
                )
                
        # Reconnection Logic: If battery is healthy (> 60%) and solar > load
        elif battery > 60.0 and solar > state['essential_load_kw'] + 10.0: # 10.0 is approx non-essential load
            if not state['is_non_essential_connected']:
                grid_sim.is_non_essential_connected = True
                self.log_action(
                    f"Grid stabilized. Battery healthy ({battery}%). Solar generation is optimal. Reconnecting non-essential agricultural pumps.",
                    "Action"
                )

# Global instance
agent = VidyutAIAgent()
