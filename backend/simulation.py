import random
import time
from typing import Dict, Any

class GridSimulation:
    def __init__(self):
        # Initial State
        self.battery_level = 80.0  # Percentage
        self.max_battery_capacity = 100.0 # kWh
        self.solar_generation_kw = 15.0
        self.essential_load_kw = 5.0
        self.non_essential_load_kw = 12.0
        
        # Load Status
        self.is_non_essential_connected = True
        
        # Grid Status
        self.grid_status = "Normal"
        
        # Weather / Time simulation modifiers
        self.cloud_cover_modifier = 1.0 # 1.0 = sunny, 0.2 = heavy clouds
        
    def update_state(self):
        """Simulates 1 tick of the microgrid (e.g., 1 minute)"""
        # Add some random noise to load and generation to simulate real world
        self.essential_load_kw = max(3.0, min(8.0, self.essential_load_kw + random.uniform(-0.5, 0.5)))
        
        if self.is_non_essential_connected:
            self.non_essential_load_kw = max(8.0, min(16.0, self.non_essential_load_kw + random.uniform(-1.0, 1.0)))
            current_total_load = self.essential_load_kw + self.non_essential_load_kw
        else:
            self.non_essential_load_kw = 0.0 # It's disconnected
            current_total_load = self.essential_load_kw
            
        # Solar generation fluctuates based on simulated cloud cover
        base_solar = 20.0
        self.solar_generation_kw = max(0.0, (base_solar * self.cloud_cover_modifier) + random.uniform(-1.0, 1.0))
        
        # Calculate battery delta
        # If generation > load, battery charges. If load > generation, battery discharges.
        net_power = self.solar_generation_kw - current_total_load
        
        # Convert kW to kWh (assuming 1 tick = 1 minute, so divide by 60 for energy)
        # For simulation speed, let's make the battery drain faster to show AI action
        energy_delta = net_power * 0.1 
        
        self.battery_level = max(0.0, min(100.0, self.battery_level + energy_delta))
        
        # Update status string
        if self.battery_level > 60:
            self.grid_status = "Normal"
        elif self.battery_level > 30:
            self.grid_status = "Warning"
        else:
            self.grid_status = "Critical"
            
        # Log to Database
        from database import get_db_connection
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO telemetry_history (
                timestamp, battery_level, solar_generation_kw, essential_load_kw, 
                non_essential_load_kw, is_non_essential_connected, grid_status, cloud_cover_modifier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (time.time(), self.battery_level, self.solar_generation_kw, self.essential_load_kw, 
              self.non_essential_load_kw, int(self.is_non_essential_connected), self.grid_status, self.cloud_cover_modifier))
        conn.commit()
        
        # Keep only the last 100 history points to prevent db bloat for this prototype
        c.execute("DELETE FROM telemetry_history WHERE id NOT IN (SELECT id FROM telemetry_history ORDER BY id DESC LIMIT 100)")
        conn.commit()
        conn.close()

    def get_state(self) -> Dict[str, Any]:
        return {
            "battery_level": round(self.battery_level, 2),
            "solar_generation_kw": round(self.solar_generation_kw, 2),
            "essential_load_kw": round(self.essential_load_kw, 2),
            "non_essential_load_kw": round(self.non_essential_load_kw, 2),
            "is_non_essential_connected": self.is_non_essential_connected,
            "grid_status": self.grid_status,
            "cloud_cover_modifier": self.cloud_cover_modifier,
            "timestamp": time.time()
        }

# Global instance for the FastAPI app to use
grid_sim = GridSimulation()
