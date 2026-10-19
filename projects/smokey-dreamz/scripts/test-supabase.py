import json
import os
import sys
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "").strip()

missing = [
    name
    for name, value in (
        ("SUPABASE_URL", SUPABASE_URL),
        ("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY),
    )
    if not value
]
if missing:
    sys.exit("Missing required environment variable(s): " + ", ".join(missing))

url = f"{SUPABASE_URL}/rest/v1/products?select=id,name,category,is_available&limit=5"
headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}
request = urllib.request.Request(url, headers=headers)
data = json.loads(urllib.request.urlopen(request).read())
print(f"Products returned: {len(data)}")
for product in data:
    print(f"  {product['id']} | {product['name']} | {product['category']}")
