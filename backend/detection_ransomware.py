from datetime import datetime

def check_ransomware_staging(file_events: list, rename_threshold: int = 10, time_window_seconds: int = 60) -> dict:
    """
    file_events: list of dicts like:
    {"filename": "report.docx", "action": "rename", "timestamp": "2026-09-14T10:00:00"}
    """
    rename_events = [e for e in file_events if e["action"] == "rename"]

    if len(rename_events) < rename_threshold:
        return {"staging_detected": False, "rename_count": len(rename_events)}

    timestamps = sorted(
        [datetime.fromisoformat(e["timestamp"]) for e in rename_events]
    )

    earliest = timestamps[0]
    latest = timestamps[-1]
    time_span = (latest - earliest).total_seconds()

    if time_span <= time_window_seconds:
        return {
            "staging_detected": True,
            "rename_count": len(rename_events),
            "time_span_seconds": time_span
        }

    return {"staging_detected": False, "rename_count": len(rename_events)}