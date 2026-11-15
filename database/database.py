
import sqlite3
from pathlib import Path

# Database file location
DB_PATH = Path(__file__).resolve().parent / "astrocare.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def create_tables():

    conn = get_connection()
    cursor = conn.cursor()

    # Astronaut details
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS astronauts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        astronaut_id TEXT UNIQUE
    )
    """)

    # Health monitoring details
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS health_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        astronaut_id TEXT,
        heart_rate INTEGER,
        oxygen_level REAL,
        blood_pressure TEXT,
        temperature REAL,
        sleep_hours REAL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (astronaut_id)
        REFERENCES astronauts(astronaut_id)
    )
    """)

    # Emergency alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        astronaut_id TEXT,
        alert_message TEXT,
        alert_level TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

    print("AstroCare Database Created Successfully!")
    print("All tables created successfully!")

if __name__ == "__main__":
    create_tables()
