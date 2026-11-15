
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "astrocare.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Insert astronaut details
astronauts = [
    ("Alex", 32, "AST001"),
    ("John", 35, "AST002"),
    ("Sarah", 29, "AST003"),
    ("David", 31, "AST004"),
    ("Emma", 30, "AST005")
]

cursor.executemany("""
INSERT OR IGNORE INTO astronauts
(name, age, astronaut_id)
VALUES (?, ?, ?)
""", astronauts)

# Insert health records
health_records = [
    ("AST001", 75, 98, "120/80", 36.5, 8),
    ("AST002", 105, 94, "135/90", 37.2, 6),
    ("AST003", 125, 88, "150/95", 38.0, 4),
    ("AST004", 82, 97, "118/78", 36.6, 7),
    ("AST005", 90, 96, "122/82", 36.8, 7)
]

cursor.executemany("""
INSERT INTO health_records
(astronaut_id, heart_rate, oxygen_level,
blood_pressure, temperature, sleep_hours)
VALUES (?, ?, ?, ?, ?, ?)
""", health_records)

conn.commit()
conn.close()

print("Astronaut sample data inserted successfully!")
