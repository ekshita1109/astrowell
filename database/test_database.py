
from db_operations import (
    get_health_records,
    search_astronaut,
    add_alert,
    get_alerts
)

# Display all health records
print("\n--- HEALTH RECORDS ---")
records = get_health_records()

for record in records:
    print(record)

# Search for an astronaut
print("\n--- SEARCH ASTRONAUT ---")
astronaut = search_astronaut("AST001")
print(astronaut)

# Insert a sample alert
print("\n--- ADD ALERT ---")
add_alert(
    "AST003",
    "Heart rate is above the demonstration limit",
    "WARNING"
)

# Display alerts
print("\n--- ALL ALERTS ---")
for alert in get_alerts():
    print(alert)
