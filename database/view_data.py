
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "astrocare.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("""
SELECT
    astronauts.name,
    health_records.heart_rate,
    health_records.oxygen_level,
    health_records.blood_pressure,
    health_records.temperature,
    health_records.sleep_hours
FROM astronauts
JOIN health_records
ON astronauts.astronaut_id = health_records.astronaut_id
""")

records = cursor.fetchall()

print("\n====== ASTROCARE HEALTH RECORDS ======\n")

for record in records:
    print("Astronaut:", record[0])
    print("Heart Rate:", record[1], "BPM")
    print("Oxygen Level:", record[2], "%")
    print("Blood Pressure:", record[3])
    print("Temperature:", record[4])
    print("Sleep Hours:", record[5])
    print("--------------------------------")

conn.close()
