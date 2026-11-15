
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "astrocare.db"


# 1. Database connection
def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# 2. Insert new health record
def add_health_record(astronaut_id, heart_rate,
                      oxygen, bp, temperature, sleep):

    with connect_db() as conn:
        conn.execute("""
        INSERT INTO health_records
        (astronaut_id, heart_rate, oxygen_level,
         blood_pressure, temperature, sleep_hours)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (astronaut_id, heart_rate, oxygen,
              bp, temperature, sleep))

    print("Health record added successfully!")


# 3. View all health records
def get_health_records():

    with connect_db() as conn:
        records = conn.execute("""
        SELECT * FROM health_records
        ORDER BY recorded_at DESC
        """).fetchall()

    return records


# 4. Search astronaut
def search_astronaut(astronaut_id):

    with connect_db() as conn:
        result = conn.execute("""
        SELECT * FROM astronauts
        WHERE astronaut_id = ?
        """, (astronaut_id,)).fetchone()

    return result


# 5. Update astronaut details
def update_astronaut(astronaut_id, name, age):

    with connect_db() as conn:
        cursor = conn.execute("""
        UPDATE astronauts
        SET name = ?, age = ?
        WHERE astronaut_id = ?
        """, (name, age, astronaut_id))

    if cursor.rowcount:
        print("Astronaut updated successfully!")
    else:
        print("Astronaut not found!")


# 6. Store emergency alert
def add_alert(astronaut_id, message, level):

    with connect_db() as conn:
        conn.execute("""
        INSERT INTO alerts
        (astronaut_id, alert_message, alert_level)
        VALUES (?, ?, ?)
        """, (astronaut_id, message, level))

    print("Alert stored successfully!")


# 7. View emergency alerts
def get_alerts():

    with connect_db() as conn:
        alerts = conn.execute("""
        SELECT * FROM alerts
        ORDER BY created_at DESC
        """).fetchall()

    return alerts

def delete_astronaut(astronaut_id):
    with connect_db() as conn:
        cursor = conn.execute(
            "DELETE FROM astronauts WHERE astronaut_id = ?",
            (astronaut_id,)
        )

    if cursor.rowcount:
        print("Astronaut deleted successfully!")
    else:
        print("Astronaut not found!")
if __name__ == "__main__":
    print("AstroCare Database Management Ready!")
    print("Total health records:", len(get_health_records()))
    print("Total alerts:", len(get_alerts()))
