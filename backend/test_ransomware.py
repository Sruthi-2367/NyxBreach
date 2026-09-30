from detection_ransomware import check_ransomware_staging
from datetime import datetime, timedelta

# Simulate 12 file renames happening within 30 seconds - should trigger detection
base_time = datetime(2026, 9, 14, 10, 0, 0)
events = []
for i in range(12):
    events.append({
        "filename": f"file_{i}.docx",
        "action": "rename",
        "timestamp": (base_time + timedelta(seconds=i*2)).isoformat()
    })

result = check_ransomware_staging(events)
print(result)