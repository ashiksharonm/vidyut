import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'vidyut.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create AILogs table
    c.execute('''
        CREATE TABLE IF NOT EXISTS ai_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL
        )
    ''')
    
    # Create TelemetryHistory table
    c.execute('''
        CREATE TABLE IF NOT EXISTS telemetry_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp REAL NOT NULL,
            battery_level REAL NOT NULL,
            solar_generation_kw REAL NOT NULL,
            essential_load_kw REAL NOT NULL,
            non_essential_load_kw REAL NOT NULL,
            is_non_essential_connected INTEGER NOT NULL,
            grid_status TEXT NOT NULL,
            cloud_cover_modifier REAL NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
