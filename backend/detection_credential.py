import hashlib
import requests

def check_password_breach(password: str) -> dict:
    # Step A: Hash the password using SHA-1 (required by HIBP's API)
    sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()

    # Step B: Split into first 5 chars (prefix) and the rest (suffix)
    prefix = sha1_hash[:5]
    suffix = sha1_hash[5:]

    # Step C: Send only the prefix to HIBP - it returns all matching suffixes
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    response = requests.get(url)

    if response.status_code != 200:
        return {"breached": False, "count": 0, "error": "Could not reach HIBP API"}

    # Step D: Check if our suffix appears in the returned list
    hashes = response.text.splitlines()
    for line in hashes:
        returned_suffix, count = line.split(':')
        if returned_suffix == suffix:
            return {"breached": True, "count": int(count)}

    return {"breached": False, "count": 0}