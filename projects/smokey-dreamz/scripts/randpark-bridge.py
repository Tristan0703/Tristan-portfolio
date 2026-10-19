"""
Smokey Dreamz — Multi-Branch POS Bridge
Connects Aronium SQLite POS to Supabase digital menu.
Runs every 60 seconds. Targets DocumentType='Sales' receipts,
captures member barcodes via LEFT JOIN Customer, flags walk-ins
as "Walk-in/Cash". Upserts on receipt_id. 5-branch ready.
"""

import sqlite3
import os
import sys
import json
import time
import logging
from datetime import datetime, timezone, timedelta
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# ============================================================
# MULTI-BRANCH CONFIGURATION (all from environment variables)
# ============================================================
# Branch identity — set BRANCH_ID on each machine:
#   Randpark Ridge = RAN, Blairgowrie = BLA, Witbank = WIT,
#   Albertskroon = ALB, Bronkhorstspruit = BRO
BRANCH_ID = os.environ.get("BRANCH_ID", "RAN").strip().upper()

# Database path override (set per-machine). If empty, falls back
# to auto-discovery under ARONIUM_DATA_DIR.
ARONIUM_DB_PATH_OVERRIDE = os.environ.get("ARONIUM_DB_PATH", "").strip()

# Fallback data dir for Randpark PC (default RAN machine)
ARONIUM_DATA_DIR = r"C:\Users\LESEDI OPERATORS\AppData\Local\Aronium\Data"

def discover_aronium_db():
    if ARONIUM_DB_PATH_OVERRIDE:
        return ARONIUM_DB_PATH_OVERRIDE
    if not os.path.exists(ARONIUM_DATA_DIR):
        return None
    for f in os.listdir(ARONIUM_DATA_DIR):
        if f.endswith(".db") or f.endswith(".sqlite"):
            return os.path.join(ARONIUM_DATA_DIR, f)
    return None

ARONIUM_DB_PATH = discover_aronium_db() or os.path.join(ARONIUM_DATA_DIR, "Aronium.db")

# Required — supplied per machine. Never hardcode these in source.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()

_missing = [name for name, value in (
    ("SUPABASE_URL", SUPABASE_URL),
    ("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY),
) if not value]
if _missing:
    raise SystemExit(
        "Missing required environment variable(s): "
        + ", ".join(_missing)
        + ". Set them on this machine before running the bridge."
    )

SCRIPT_VERSION = "2.1.0"  # bumped each time script logic changes

DRY_RUN = False
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
SYNC_INTERVAL = 60  # 1 minute

os.makedirs(LOG_DIR, exist_ok=True)
log_file = os.path.join(LOG_DIR, f"randpark-bridge-{datetime.now().strftime('%Y-%m-%d')}.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("randpark-bridge")

# ============================================================
# ARONIUM ↔ SUPABASE PRODUCT MAPPING
# ============================================================
PLU_TO_SUPABASE_ID = {
    # === BOUTIQUE (Prerolls & Boutique buds) ===
    "43": "c98c37d1-5d29-4c3c-b965-0ff6ceb173bd",
    "45": "2a375962-d2a8-47de-97cd-cc62a456204f",
    "46": "e7a0a369-6a47-4bd5-a8dd-e77e50ed2b15",
    "55": "0176b984-a5b2-4ae6-a4d7-f391793e8732",
    "76": "600e33d9-7481-40a8-b92f-cc1b04c9dd07",
    "79": "6953ba08-4e25-4034-87e4-6e8a2e2a885a",
    "86": "a0e1c0c9-dbc6-412e-96de-7a53a2e3873c",
    "87": "35a3e981-c694-4159-b0a1-dca89c8d9ba3",
    "123": "1de8e181-b65f-41ff-9f45-8d5bdccb2afa",
    "139": "d3a71f49-3fa9-4a3f-ae83-f3f708712ead",
    "142": "600e33d9-7481-40a8-b92f-cc1b04c9dd07",
    "148": "e7a0a369-6a47-4bd5-a8dd-e77e50ed2b15",
    "150": "f3943b7f-190d-4c2d-ba13-d51c1a0ba40f",
    "153": "31a1c238-5fe4-4a1d-9e3e-9dc0c14017cd",
    "157": "3bef9a57-076a-47c6-90ea-cb0ab7c4ff08",
    "185": "caea2bf9-442c-4bb6-973b-21ae6f588dbc",
    "192": "c98c37d1-5d29-4c3c-b965-0ff6ceb173bd",
    "199": "31a1c238-5fe4-4a1d-9e3e-9dc0c14017cd",
    "210": "d3a71f49-3fa9-4a3f-ae83-f3f708712ead",
    "211": "6953ba08-4e25-4034-87e4-6e8a2e2a885a",
    "224": "c98c37d1-5d29-4c3c-b965-0ff6ceb173bd",
    "253": "05d9dacd-52d0-42bc-b7c4-84d3056de3e3",
    "270": "d8722fb3-26ef-4f71-8b94-d2d730f95edb",
    "271": "73b060f0-3cc6-4de0-8a80-d2c5b2901d58",
    "274": "c35e8a76-49be-4304-a543-a6ef08ce3198",
    "293": "35a3e981-c694-4159-b0a1-dca89c8d9ba3",
    "295": "0a9f606a-535b-422c-a5da-a798f5c406d3",
    "296": "e576a1a1-dd66-41ca-9ffe-687d95cc8c45",
    "306": "3bef9a57-076a-47c6-90ea-cb0ab7c4ff08",
    "307": "0a9f606a-535b-422c-a5da-a798f5c406d3",
    "312": "2a375962-d2a8-47de-97cd-cc62a456204f",
    "314": "247c3b54-f598-4051-87a7-75fa50105fa3",
    "315": "c35e8a76-49be-4304-a543-a6ef08ce3198",
    "316": "2833bf80-9930-48ce-9c31-cad2a5b0f2a2",
    "317": "1de8e181-b65f-41ff-9f45-8d5bdccb2afa",
    "318": "e2cdf90b-78aa-46ad-ac58-e16e6c804887",
    "323": "1de8e181-b65f-41ff-9f45-8d5bdccb2afa",
    "324": "c35e8a76-49be-4304-a543-a6ef08ce3198",
    "329": "73b060f0-3cc6-4de0-8a80-d2c5b2901d58",
    # === PREMIUM (Buds & Jars) ===
    "22": "f0e0504f-f56a-486a-bd50-26559cb69417",
    "50": "248f5e23-1538-4fa7-9b29-2ef87f61d513",
    "67": "c35e8a76-49be-4304-a543-a6ef08ce3198",
    "68": "6fa4f9ee-8316-4ac3-9138-bc3af119c0ca",
    "90": "05d9dacd-52d0-42bc-b7c4-84d3056de3e3",
    "91": "d8722fb3-26ef-4f71-8b94-d2d730f95edb",
    "112": "c03097db-2555-4eb4-bc42-fabd307cc91e",
    "119": "c03097db-2555-4eb4-bc42-fabd307cc91e",
    "124": "c03097db-2555-4eb4-bc42-fabd307cc91e",
    "132": "05d9dacd-52d0-42bc-b7c4-84d3056de3e3",
    "155": "d982b445-7a56-4abf-80e2-678c3eeda629",
    "159": "9414450c-472b-4fce-a5d8-69352d6ce629",
    "166": "9414450c-472b-4fce-a5d8-69352d6ce629",
    "171": "6fa4f9ee-8316-4ac3-9138-bc3af119c0ca",
    "181": "c03097db-2555-4eb4-bc42-fabd307cc91e",
    "183": "d8722fb3-26ef-4f71-8b94-d2d730f95edb",
    "189": "22c209c4-747a-4cd7-bdad-e6b1957d74bd",
    "212": "f340e120-2c84-40f4-910d-aabc61e8db8f",
    "213": "0f8445a8-464c-4c86-ad3f-fff324047c0d",
    "218": "22c209c4-747a-4cd7-bdad-e6b1957d74bd",
    "237": "d8722fb3-26ef-4f71-8b94-d2d730f95edb",
    "238": "8c60a45e-cb42-4547-b8d2-14a1b1765335",
    "239": "1f936630-fcac-40a7-9e1c-6207c09bff29",
    "246": "cf758e18-bfd4-4f20-b316-acd6f6075da9",
    "247": "6953ba08-4e25-4034-87e4-6e8a2e2a885a",
    "248": "6fa4f9ee-8316-4ac3-9138-bc3af119c0ca",
    "251": "d420101a-4f8b-45fe-8ba6-8fdb1d5f3626",
    "252": "a2e702ed-3e67-417a-942d-2ffbc9e17dce",
    "269": "165b0a7b-c2d9-4b6e-a3ac-b676870c0bee",
    "272": "f0e0504f-f56a-486a-bd50-26559cb69417",
    "275": "a90dbded-bec8-4eaf-91ba-7c151140863d",
    "277": "70a22071-1716-40a6-a587-7d307e5754ab",
    "278": "92a6e25c-ca0e-4f58-ac40-3f34fa7e94f6",
    "279": "28f61b72-f85e-4325-b69f-d51747431663",
    "281": "816e73a7-5bb1-4f05-9b72-689a8b337278",
    "282": "27cd49fc-e382-4383-bcf4-7772f0c3d95a",
    "283": "f3943b7f-190d-4c2d-ba13-d51c1a0ba40f",
    "287": "a6b3cf37-5a63-4411-95db-0e07c125bf17",
    "290": "22c209c4-747a-4cd7-bdad-e6b1957d74bd",
    "305": "20ec8e05-6bfa-467a-bb84-43f6ec51e602",
    "309": "742a4f81-32d7-4efd-b697-7454562529a4",
    "311": "61e794ce-8820-4d99-a9e6-7a7b8582e024",
    "319": "23aedc6d-9e0b-432e-8ad5-a966130fe43d",
    "320": "037dd37d-a1ff-4641-9d17-ab0dd6217694",
    "322": "a5d35f6b-027b-414a-aa57-2bdccccb6d05",
    # === EDIBLES ===
    "4": "85cd5a45-0e51-4485-a35b-2601c289110f",
    "5": "63f2e7fe-3b43-49d6-b36b-1ff63d81dd5b",
    "6": "c391bc8e-17f4-4a68-96b9-13026d041d5e",
    "8": "e064f714-4f6e-4c47-95bb-eb7c2b4d526a",
    "11": "d441f1fb-57e6-4916-9c56-6811acddaee0",
    "12": "ad1db793-3107-4e81-96ef-6f1553912fce",
    "13": "2bb6a4f3-e673-4568-ab32-388ab5786a13",
    "14": "5bf5f797-4221-4ce8-9324-f85371333348",
    "15": "678a9612-1797-482b-bd19-e8ab7939e05e",
    "16": "74383073-0f54-48f2-936f-ec23b24e975c",
    "18": "1690bf42-0315-4b98-87a2-ab665701341d",
    "229": "ef0aa95c-9d18-4b7d-b7cb-de1677c2bc24",
    "230": "d5c5bb3b-49fe-43ef-8c67-321b45110695",
    "232": "38ff13ca-dd26-4d41-8300-690cb2ec2995",
    "234": "479689e2-9710-4db2-a2ed-aae7e9e21af8",
    "261": "ad1db793-3107-4e81-96ef-6f1553912fce",
    "262": "e02cb894-0768-4a15-ae4a-2f6d918c4332",
    "263": "c0f1166d-3e60-43d7-956f-378076c4c4ec",
    "284": "bc5af01c-a4b6-4964-adc9-256a09054216",
    "285": "479689e2-9710-4db2-a2ed-aae7e9e21af8",
    "286": "38ff13ca-dd26-4d41-8300-690cb2ec2995",
    "326": "0ca07e43-ed7f-4ed5-9e93-9b2227b5bb14",
    "327": "33519fab-304e-41ee-a45f-b666491b0133",
    "328": "54d2aced-79e1-4e65-9037-c21bde822458",
}

NAME_FALLBACKS = {
    "blockberry preroll": "2a375962-d2a8-47de-97cd-cc62a456204f",
    "coffee breath": "e2cdf90b-78aa-46ad-ac58-e16e6c804887",
    "coffee breath preroll": "a034adf8-639c-4972-90b9-435cacef1e45",
    "critical kush": "23aedc6d-9e0b-432e-8ad5-a966130fe43d",
    "downward dog": "92a6e25c-ca0e-4f58-ac40-3f34fa7e94f6",
    "fanta sea": "b527f96c-2e43-4f9c-b464-d4b90d8ffee2",
    "gelato": "e7a0a369-6a47-4bd5-a8dd-e77e50ed2b15",
    "ice lemon": "f3943b7f-190d-4c2d-ba13-d51c1a0ba40f",
    "la cron": "6953ba08-4e25-4034-87e4-6e8a2e2a885a",
    "master kush": "165b0a7b-c2d9-4b6e-a3ac-b676870c0bee",
    "master trainwreck": "20ec8e05-6bfa-467a-bb84-43f6ec51e602",
    "master trainwreck preroll": "10ef9c1c-d339-412a-b5dc-43f6ec51e602",
    "medusa": "70a22071-1716-40a6-a587-7d307e5754ab",
    "nag champa": "0a9f606a-535b-422c-a5da-a798f5c406d3",
    "palm kush": "2833bf80-9930-48ce-9c31-cad2a5b0f2a2",
    "pau hana": "1f936630-fcac-40a7-9e1c-6207c09bff29",
    "pau hana preroll": "e992a489-46f4-47f3-9863-8ac12e9bfb79",
    "permanent marker": "c98c37d1-5d29-4c3c-b965-0ff6ceb173bd",
    "plat kush": "35a3e981-c694-4159-b0a1-dca89c8d9ba3",
    "quantum berry": "a5d35f6b-027b-414a-aa57-2bdccccb6d05",
    "slurry cane": "3bef9a57-076a-47c6-90ea-cb0ab7c4ff08",
    "sour d": "576184d7-85e1-41c6-bb24-085079fd0ea1",
    "sour diesel": "27cd49fc-e382-4383-bcf4-7772f0c3d95a",
    "stanky cheese": "378270d6-2189-4171-8027-7f7efae5dbee",
    "swazi gold": "037dd37d-a1ff-4641-9d17-ab0dd6217694",
    "tart pops": "d3a71f49-3fa9-4a3f-ae83-f3f708712ead",
    "tart pops preroll": "40da4a19-fe9e-487a-8276-bfb4492ef60b",
    "triple cheese": "1de8e181-b65f-41ff-9f45-8d5bdccb2afa",
    "twisted pie": "d420101a-4f8b-45fe-8ba6-8fdb1d5f3626",
    "ww": "600e33d9-7481-40a8-b92f-cc1b04c9dd07",
    "zoap": "8c60a45e-cb42-4547-b8d2-14a1b1765335",
    "zoap preroll": "e576a1a1-dd66-41ca-9ffe-687d95cc8c45",
    "banana daddy": "d982b445-7a56-4abf-80e2-678c3eeda629",
    "black cherry punch": "f340e120-2c84-40f4-910d-aabc61e8db8f",
    "block berry": "6fa4f9ee-8316-4ac3-9138-bc3af119c0ca",
    "citradelic sunset": "31a1c238-5fe4-4a1d-9e3e-9dc0c14017cd",
    "d. dog": "15a32302-f99a-413c-b4df-9f2ad6b6ac8d",
    "divine storm": "0176b984-a5b2-4ae6-a4d7-f391793e8732",
    "ethos": "c03097db-2555-4eb4-bc42-fabd307cc91e",
    "f1 cheese": "0f8445a8-464c-4c86-ad3f-fff324047c0d",
    "fruit king": "61e794ce-8820-4d99-a9e6-7a7b8582e024",
    "gorilla glue": "c35e8a76-49be-4304-a543-a6ef08ce3198",
    "granny smith": "28f61b72-f85e-4325-b69f-d51747431663",
    "gsc": "9414450c-472b-4fce-a5d8-69352d6ce629",
    "jungle berry": "05d9dacd-52d0-42bc-b7c4-84d3056de3e3",
    "jungle diamonds": "caea2bf9-442c-4bb6-973b-21ae6f588dbc",
    "king fruit": "61e794ce-8820-4d99-a9e6-7a7b8582e024",
    "lilac diesel": "f0e0504f-f56a-486a-bd50-26559cb69417",
    "mac stomper": "cf758e18-bfd4-4f20-b316-acd6f6075da9",
    "mandarin": "248f5e23-1538-4fa7-9b29-2ef87f61d513",
    "mokums tulip": "a90dbded-bec8-4eaf-91ba-7c151140863d",
    "rainbow marker": "d8722fb3-26ef-4f71-8b94-d2d730f95edb",
    "ricky bobby": "22c209c4-747a-4cd7-bdad-e6b1957d74bd",
    "sour d": "a6b3cf37-5a63-4411-95db-0e07c125bf17",
    "triple x": "816e73a7-5bb1-4f05-9b72-689a8b337278",
    "world fire": "73b060f0-3cc6-4de0-8a80-d2c5b2901d58",
    "ww2": "a2e702ed-3e67-417a-942d-2ffbc9e17dce",
    "zephyr": "742a4f81-32d7-4efd-b697-7454562529a4",
    "bones": "479689e2-9710-4db2-a2ed-aae7e9e21af8",
    "brownie": "ef0aa95c-9d18-4b7d-b7cb-de1677c2bc24",
    "chocolate slab": "1690bf42-0315-4b98-87a2-ab665701341d",
    "cookies": "e064f714-4f6e-4c47-95bb-eb7c2b4d526a",
    "donuts": "38ff13ca-dd26-4d41-8300-690cb2ec2995",
    "gummy bears": "63f2e7fe-3b43-49d6-b36b-1ff63d81dd5b",
    "jelly tots": "c391bc8e-17f4-4a68-96b9-13026d041d5e",
    "jubes": "85cd5a45-0e51-4485-a35b-2601c289110f",
    "leaves": "d441f1fb-57e6-4916-9c56-6811acddaee0",
    "lollipop 10mg": "2bb6a4f3-e673-4568-ab32-388ab5786a13",
    "lollipop 25mg": "5bf5f797-4221-4ce8-9324-f85371333348",
    "lollipop 50mg": "678a9612-1797-482b-bd19-e8ab7939e05e",
    "lollipop 100mg": "74383073-0f54-48f2-936f-ec23b24e975c",
    "mango juice": "e02cb894-0768-4a15-ae4a-2f6d918c4332",
    "mango shot": "74a10b01-f89e-4370-9df7-814052313657",
    "marshmallow": "54d2aced-79e1-4e65-9037-c21bde822458",
    "peanut butter": "d5c5bb3b-49fe-43ef-8c67-321b45110695",
    "rainbows": "ad1db793-3107-4e81-96ef-6f1553912fce",
    "rolo": "33519fab-304e-41ee-a45f-b666491b0133",
    "skulls": "bc5af01c-a4b6-4964-adc9-256a09054216",
    "snickers": "0ca07e43-ed7f-4ed5-9e93-9b2227b5bb14",
    "sobolo": "c0f1166d-3e60-43d7-956f-378076c4c4ec",
}

SKIP_PLU = {
    "28","29","30","31","32","33","34","35","36","37",
    "72","73","74","103","107","108","109","158","184",
    "236","244","245","264","265","266","267","291","325",
}


def get_service_key():
    return SUPABASE_SERVICE_KEY if SUPABASE_SERVICE_KEY else SUPABASE_ANON_KEY


def supabase_request(method, path, body=None):
    url = f"{SUPABASE_URL}{path}"
    headers = {
        "apikey": get_service_key(),
        "Authorization": f"Bearer {get_service_key()}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    data = json.dumps(body).encode("utf-8") if body else None
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        logger.error(f"Supabase API error {e.code} on {method} {path}: {error_body[:500]}")
        raise
    except URLError as e:
        logger.error(f"Supabase connection error on {method} {path}: {e.reason}")
        raise
    except TimeoutError:
        logger.error(f"Supabase timeout on {method} {path}")
        raise


def supabase_upsert(path, body):
    """POST with merge-duplicates (upsert using receipt_id unique constraint)."""
    url = f"{SUPABASE_URL}{path}"
    headers = {
        "apikey": get_service_key(),
        "Authorization": f"Bearer {get_service_key()}",
        "Content-Type": "application/json",
        "Prefer": "return=representation, resolution=merge-duplicates",
    }
    data = json.dumps(body).encode("utf-8")
    req = Request(url, data=data, headers=headers, method="POST")
    try:
        with urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else []
    except HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        logger.error(f"Supabase upsert error {e.code} on {path}: {error_body[:500]}")
        raise
    except URLError as e:
        logger.error(f"Supabase connection error on upsert {path}: {e.reason}")
        raise


def fetch_branch_products():
    """Fetch all products from Supabase for this branch, return lookup by barcode/sku/name."""
    try:
        products = supabase_request("GET", f"/rest/v1/products?branch_id=eq.{BRANCH_ID}&select=id,name,barcode,sku")
        lookup = {}
        for p in products:
            uid = p["id"]
            b = (p.get("barcode") or "").strip()
            s = (p.get("sku") or "").strip()
            n = (p.get("name") or "").strip().lower()
            if b:
                lookup[b] = uid
            if s:
                lookup[s] = uid
            if n:
                lookup[n] = uid
        logger.info(f"Loaded {len(products)} cloud products for {BRANCH_ID}")
        return lookup
    except Exception as e:
        logger.error(f"Failed to fetch branch products: {e}")
        return {}


def insert_new_product(name, plu, price, category, quantity):
    """Insert a new product into Supabase and return its UUID."""
    payload = {
        "name": name,
        "barcode": str(plu).strip() if plu else "",
        "sku": str(plu).strip() if plu else "",
        "category": category,
        "price": float(price) if price else 0,
        "branch_id": BRANCH_ID,
        "stock_quantity": quantity,
        "is_available": quantity > 0,
    }
    try:
        result = supabase_request("POST", "/rest/v1/products", payload)
        row = result[0] if isinstance(result, list) else result
        new_id = row["id"]
        print(f"    [AUTO-CATALOG] ✅ Created '{name}' (barcode={plu}) → id={new_id[:8]}...")
        logger.info(f"[AUTO-CATALOG] Created product: {name} barcode={plu} id={new_id}")
        return new_id
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:400]
        print(f"    [AUTO-CATALOG] ❌ HTTP {e.code} creating '{name}': {body}")
        raise
    except Exception as e:
        print(f"    [AUTO-CATALOG] ❌ Error creating '{name}': {e}")
        raise


def resolve_supabase_id(plu, name):
    plu_str = str(plu).strip() if plu is not None else None
    if plu_str and plu_str in SKIP_PLU:
        return None
    if plu_str and plu_str in PLU_TO_SUPABASE_ID:
        return PLU_TO_SUPABASE_ID[plu_str]
    if name:
        name_lower = name.lower().strip()
        if name_lower in NAME_FALLBACKS:
            return NAME_FALLBACKS[name_lower]
        for key, supabase_id in NAME_FALLBACKS.items():
            if key in name_lower or name_lower in key:
                return supabase_id
    return None


# ============================================================
# DIAGNOSTIC HELPERS
# ============================================================

def diagnostic_banner(label, status, detail=""):
    status_icon = "✅" if status else "❌"
    line = f"  {status_icon} [{label}]"
    if detail:
        line += f" {detail}"
    print(line)
    logger.info(f"[{label}] status={status} detail={detail}")


def print_hsep(title=""):
    sep = "=" * 60
    print(f"\n{sep}")
    if title:
        print(f"  {title}")
        print(sep)


def dump_schema_sample(cursor, table_name, limit=3):
    """Query first N rows of a table and print column names + sample data."""
    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        cols = [dict(row) for row in cursor.fetchall()]
        col_names = [c["name"] for c in cols]
        cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
        rows = [dict(row) for row in cursor.fetchall()]
        print(f"  📋 TABLE {table_name} columns ({len(col_names)}): {col_names}")
        print(f"  📋 TABLE {table_name} sample ({len(rows)} rows):")
        for r in rows:
            print(f"      {json.dumps(r, default=str)[:200]}")
    except sqlite3.Error as e:
        print(f"  ⚠ Could not read {table_name}: {e}")


def diagnose_documents_24h(cursor):
    """Query all document types found in the past 24 hours for diagnosis."""
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='DocumentType'")
        if not cursor.fetchone():
            print("  ⚠ [DOC DIAGNOSTIC] DocumentType table not found — skipping")
            return
        query = """
            SELECT dt.Name as doc_type, po.DocumentTypeId, COUNT(*) as count
            FROM PosOrder po
            JOIN DocumentType dt ON po.DocumentTypeId = dt.Id
            WHERE po.DateCreated > datetime('now', '-1 day')
            GROUP BY po.DocumentTypeId, dt.Name
            ORDER BY count DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        print(f"  🔍 [DOC DIAGNOSTIC] Documents (past 24h) by type:")
        if rows:
            for r in rows:
                print(f"      TypeId={r['DocumentTypeId']}  '{r['doc_type']}' → {r['count']} orders")
        else:
            print(f"      (no documents found in past 24h)")
    except sqlite3.Error as e:
        print(f"  ⚠ [DOC DIAGNOSTIC] Error: {e}")
        try:
            dump_schema_sample(cursor, "DocumentType")
            cursor.execute("SELECT Id, Name FROM DocumentType LIMIT 20")
            rows = cursor.fetchall()
            print(f"  📋 All DocumentTypes ({len(rows)}):")
            for r in rows:
                print(f"      Id={r['Id']}  Name='{r['Name']}'")
        except Exception:
            pass


# ============================================================
# CONNECTIVITY
# ============================================================

def test_connection():
    results = {"aronium": False, "supabase": False, "errors": []}

    # Aronium
    print("[CONNECTIVITY TEST] Checking Aronium SQLite...")
    try:
        if not os.path.exists(ARONIUM_DB_PATH):
            results["errors"].append(f"DB not found: {ARONIUM_DB_PATH}")
            diagnostic_banner("ARONIUM DB FILE", False, f"Not found at {ARONIUM_DB_PATH}")
        else:
            conn = sqlite3.connect(f"file:{ARONIUM_DB_PATH}?mode=ro", uri=True)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            conn.close()
            results["aronium"] = True
            diagnostic_banner("ARONIUM DB FILE", True, f"Found at {ARONIUM_DB_PATH}")
            logger.info(f"  Tables: {tables}")
    except sqlite3.Error as e:
        results["errors"].append(f"SQLite error: {str(e)}")
        diagnostic_banner("ARONIUM DB FILE", False, str(e))

    # Supabase
    print("[CONNECTIVITY TEST] Pinging Supabase...")
    try:
        data = supabase_request("GET", "/rest/v1/products?limit=1&select=id")
        results["supabase"] = True
        diagnostic_banner("SUPABASE API", True, f"Products accessible ({len(data)} rows)")
    except Exception as e:
        results["errors"].append(str(e))
        diagnostic_banner("SUPABASE API", False, str(e)[:120])

    return results


# ============================================================
# ARONIUM DATA READS
# ============================================================

def read_aronium_inventory():
    """
    Reads current inventory from Aronium's Product + Stock tables.
    Filters by WarehouseId=1 (main retail). Logs all detected columns
    on first call to aid debugging.
    """
    if not os.path.exists(ARONIUM_DB_PATH):
        print("  [ARONIUM DATA DETECTED] ❌ Aronium DB file missing")
        return []

    conn = sqlite3.connect(f"file:{ARONIUM_DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # Probe Stock table columns to know what warehouse fields exist
        stock_columns = []
        has_warehouse_col = False
        try:
            cursor.execute("PRAGMA table_info(Stock)")
            stock_columns = [row["name"] for row in cursor.fetchall()]
            has_warehouse_col = "WarehouseId" in stock_columns or "Warehouse_ID" in stock_columns or "Warehouse" in stock_columns
            logger.info(f"Stock table columns: {stock_columns}")
        except Exception:
            pass

        # Build warehouse filter if the column exists
        warehouse_filter = ""
        if has_warehouse_col:
            warehouse_col = [c for c in stock_columns if "warehouse" in c.lower()][0]
            warehouse_filter = f" AND s.\"{warehouse_col}\" = 1"
            logger.info(f"Filtering Stock by {warehouse_col}=1 (main retail warehouse)")

        # Also probe Product table for update-tracking columns
        product_columns = []
        has_update_col = False
        update_col_name = "UpdatedDate"
        try:
            cursor.execute("PRAGMA table_info(Product)")
            product_columns = [row["name"] for row in cursor.fetchall()]
            for candidate in ["UpdatedDate", "UpdateDate", "LastModified", "ModifiedDate", "DateModified"]:
                if candidate in product_columns:
                    has_update_col = True
                    update_col_name = candidate
                    break
            logger.info(f"Product table columns: {product_columns}")
        except Exception:
            pass

        # Read current stock levels
        query = f"""
            SELECT 
                p.Id as product_id,
                p.Name,
                p.Price,
                p.PLU,
                COALESCE(s.Quantity, 0) as stock_quantity,
                COALESCE(s.Quantity, 0) as quantity
            FROM Product p
            LEFT JOIN Stock s ON p.Id = s.ProductId
            WHERE p.IsEnabled = 1{warehouse_filter}
            ORDER BY p.Name ASC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        print(f"  [ARONIUM DATA DETECTED] ✅ {len(rows)} products with stock levels")

        # Dump low-stock items immediately for visibility
        low_stock = [dict(r) for r in rows if int(r["stock_quantity"] or 0) <= 5]
        if low_stock:
            print(f"  ⚠  Low-stock items ({len(low_stock)}):")
            for item in low_stock[:10]:
                print(f"      {item['Name']}: {item['stock_quantity']} left")
            if len(low_stock) > 10:
                print(f"      ... and {len(low_stock) - 10} more")

        inventory = []
        for row in rows:
            item = dict(row)
            name = item.get("Name", "") or item.get("name", "")
            qty = int(item.get("quantity", 0) or 0)
            item["quantity"] = qty

            # Normalize category
            if name:
                if "Preroll" in name or name in ["La Cron", "Pau Hana", "Zoap", "Tart Pops", "Master Trainwreck", "Coffee Breath", "Quantum Berry"]:
                    item["category"] = "Boutique"
                elif any(x in name for x in ["Mango", "Sobolo", "Juice", "Shot", "Bears", "Donuts", "Bones", "Skulls", "Jelly", "Lollipop", "Snickers", "Brownie", "Peanut Butter", "Rolo", "Marshmallow", "Cookies", "Suckers", "Gummy", "Jubes", "Chocolate", "Rainbows", "Leaves"]):
                    item["category"] = "Edibles"
                else:
                    item["category"] = "Premium"
            inventory.append(item)

        return inventory

    except sqlite3.Error as e:
        print(f"  [ARONIUM DATA DETECTED] ❌ SQLite error: {e}")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row["name"] for row in cursor.fetchall()]
        for table in ["Product", "Stock"]:
            if table in tables:
                cursor.execute(f"PRAGMA table_info({table})")
                cols = cursor.fetchall()
                logger.info(f"TABLE {table}: {[dict(c) for c in cols]}")
        return []
    finally:
        conn.close()


def probe_customer_columns(cursor):
    """Check if Customer table exists and find barcode/membership column."""
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Customer'")
        if not cursor.fetchone():
            return None, None
        cursor.execute("PRAGMA table_info(Customer)")
        cols = [row["name"] for row in cursor.fetchall()]
        logger.info(f"Customer table columns: {cols}")
        barcode_candidates = ["Barcode", "barcode", "BarCode", "Bar_Code", "MembershipId", "Membership_ID", "ExternalId"]
        for c in barcode_candidates:
            if c in cols:
                return True, c
        return True, None
    except sqlite3.Error:
        return None, None


def probe_sales_document_type_id(cursor):
    """Find the DocumentTypeId for 'Sales' in the DocumentType table."""
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='DocumentType'")
        if not cursor.fetchone():
            logger.warning("DocumentType table not found — cannot filter by 'Sales'")
            return None
        cursor.execute("SELECT Id, Name FROM DocumentType")
        all_types = {row["Name"]: row["Id"] for row in cursor.fetchall()}
        logger.info(f"DocumentType entries: {all_types}")
        sales_id = all_types.get("Sales")
        if sales_id is not None:
            logger.info(f"Found 'Sales' DocumentTypeId = {sales_id}")
            return sales_id
        logger.warning("No DocumentType named 'Sales' found — trying first type")
        return None
    except sqlite3.Error as e:
        logger.warning(f"Could not probe DocumentType: {e}")
        return None


def read_aronium_sales(since=None):
    if not os.path.exists(ARONIUM_DB_PATH):
        return []

    conn = sqlite3.connect(f"file:{ARONIUM_DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        # Find the "Sales" DocumentTypeId
        sales_type_id = probe_sales_document_type_id(cursor)

        # Probe Customer table for barcode column
        has_customer, barcode_col = probe_customer_columns(cursor)
        barcode_expr = f"c.{barcode_col} as member_barcode" if has_customer and barcode_col else "NULL as member_barcode"
        customer_name_expr = "c.Name as customer_name" if has_customer else "NULL as customer_name"
        customer_join = "LEFT JOIN Customer c ON po.CustomerId = c.Id" if has_customer else ""

        # Probe PosOrder for DocumentTypeId column
        cursor.execute("PRAGMA table_info(PosOrder)")
        po_cols = [row["name"] for row in cursor.fetchall()]
        has_doc_type = "DocumentTypeId" in po_cols
        doc_type_join = "JOIN DocumentType dt ON po.DocumentTypeId = dt.Id" if has_doc_type else ""
        doc_type_filter = "AND dt.Name = 'Sales'" if has_doc_type else ""

        query = f"""
            SELECT 
                po.Id as order_id,
                po.Number as receipt_id,
                po.DateCreated as sale_date,
                po.Total as order_total,
                po.CustomerId as customer_id,
                {barcode_expr},
                {customer_name_expr}
                {', dt.Name as document_type' if has_doc_type else ''}
            FROM PosOrder po
            {doc_type_join}
            {customer_join}
            WHERE 1=1 {doc_type_filter}
        """
        if since:
            query += f" AND po.DateCreated > '{since}'"
        query += " ORDER BY po.DateCreated ASC"

        cursor.execute(query)
        rows = cursor.fetchall()
        count = len(rows)
        print(f"  [ARONIUM CAPTURED] {count} retail 'Sales' receipts processed")
        logger.info(f"Found {count} 'Sales' receipts in Aronium")

        if rows:
            logger.info(f"Sample Aronium receipt: {dict(rows[0])}")

        sales = []
        for row in rows:
            sale = dict(row)
            barcode = (sale.get("member_barcode") or "").strip()
            cust_name = (sale.get("customer_name") or "").strip()
            is_walkin = (not barcode) and (not cust_name or cust_name.lower() == "walk-in customer")
            sale["is_walkin"] = is_walkin
            if barcode:
                sale["membership_id"] = barcode
                print(f"    [MEMBER STATUS] Receipt {sale['receipt_id']}: Member barcode → {barcode}")
            else:
                sale["membership_id"] = "Walk-in/Cash"
                print(f"    [MEMBER STATUS] Receipt {sale['receipt_id']}: Walk-in/Cash")
            sales.append(sale)

        return sales

    except sqlite3.Error as e:
        logger.error(f"Error reading 'Sales' receipts: {e}")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row["name"] for row in cursor.fetchall()]
        for table in ["PosOrder", "DocumentType", "Customer"]:
            if table in tables:
                cursor.execute(f"PRAGMA table_info({table})")
                columns = cursor.fetchall()
                logger.info(f"TABLE {table}: {[dict(c) for c in columns]}")
        return []
    finally:
        conn.close()


# ============================================================
# SUPABASE WRITES
# ============================================================

def upsert_receipt_to_supabase(sale_data):
    receipt_id = str(sale_data.get("receipt_id", "")).strip()
    total = float(sale_data.get("order_total", 0))
    membership_id = sale_data.get("membership_id", "")

    payload = {
        "product_name": "Retail Sale",
        "product_category": "Retail",
        "quantity": 1,
        "unit_price": total,
        "total_amount": total,
        "branch_id": BRANCH_ID,
        "receipt_id": receipt_id,
        "sale_date": sale_data.get("sale_date", datetime.now(timezone.utc).isoformat()),
        "source": "aronium",
        "membership_id": membership_id if membership_id else None,
    }

    logger.info(f"  [SUPABASE RESPONSE] Upserting receipt {receipt_id}: R{total:.2f}")

    if DRY_RUN:
        print(f"  [SUPABASE RESPONSE] Dry-run — would upsert receipt {receipt_id}")
        return None

    try:
        result = supabase_upsert("/rest/v1/sales", payload)
        if result and len(result) > 0:
            row = result[0] if isinstance(result, list) else result
            resp_text = f"id={row.get('id','?')[:8]}... receipt_id={row.get('receipt_id','?')} total=R{row.get('total_amount',0)}"
            print(f"  [SUPABASE RESPONSE] ✅ Receipt {receipt_id} upserted → {resp_text}")
            logger.info(f"[SUPABASE RESPONSE] Receipt {receipt_id} upserted: {json.dumps(row, default=str)[:300]}")
        else:
            print(f"  [SUPABASE RESPONSE] ⚠ Receipt {receipt_id} acknowledged (empty response)")
        return result
    except HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")[:500]
        print(f"  [SUPABASE RESPONSE] ❌ Receipt {receipt_id} HTTP {e.code}: {error_body[:200]}")
        logger.error(f"[SUPABASE RESPONSE] Receipt {receipt_id} failed: HTTP {e.code}: {error_body}")
        return None
    except Exception as e:
        print(f"  [SUPABASE RESPONSE] ❌ Receipt {receipt_id} error: {str(e)[:200]}")
        logger.error(f"[SUPABASE RESPONSE] Receipt {receipt_id} error: {e}")
        return None


def sync_inventory_to_supabase(inventory_items):
    # 1. Fetch current cloud catalog for this branch (barcode/sku/name → uuid)
    cloud_products = fetch_branch_products()

    stock_updated = 0
    auto_created = 0
    failed = 0
    unavailable = 0

    for item in inventory_items:
        plu = str(item.get("PLU") or item.get("plu") or "").strip()
        name = item.get("Name") or item.get("name", "")
        price = item.get("Price") or item.get("price", 0)
        quantity = int(item.get("quantity") or item.get("stock_quantity", 0) or 0)
        is_available = quantity > 0
        category = item.get("category", "Premium")

        if not name:
            continue

        # 2. Resolve product UUID: by barcode → by name → auto-insert
        product_id = cloud_products.get(plu) or cloud_products.get(name.lower().strip())

        if not product_id:
            try:
                product_id = insert_new_product(name, plu, price, category, quantity)
                auto_created += 1
                cloud_products[plu] = product_id
                cloud_products[name.lower().strip()] = product_id
                # New product is already saved with correct stock — continue
                continue
            except Exception as e:
                print(f"    [AUTO-CATALOG] ❌ Failed to create '{name}': {e}")
                failed += 1
                continue

        # 3. Update existing product stock and availability
        payload = {
            "stock_quantity": quantity,
            "is_available": is_available,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        logger.info(f"  [STOCK SYNC] Patching {name}: {json.dumps(payload)}")

        if DRY_RUN:
            logger.info(f"[DRY RUN] Would update {name}: qty={quantity}, available={is_available}")
            continue

        try:
            url = f"/rest/v1/products?id=eq.{product_id}&branch_id=eq.{BRANCH_ID}"
            supabase_request("PATCH", url, payload)
            stock_updated += 1
            if not is_available:
                unavailable += 1
                print(f"    ⚠  {name}: stock={quantity} → marked unavailable")
        except HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")[:400]
            print(f"    [STOCK SYNC] ❌ HTTP {e.code} updating '{name}': {error_body}")
            failed += 1
        except Exception as e:
            print(f"    [STOCK SYNC] ❌ Error updating '{name}': {e}")
            failed += 1

    return {"stock_updated": stock_updated, "auto_created": auto_created, "failed": failed, "unavailable": unavailable}


def get_last_sync_date():
    try:
        result = supabase_request(
            "GET",
            f"/rest/v1/sales?branch_id=eq.{BRANCH_ID}&order=sale_date.desc&limit=1&select=sale_date",
        )
        if result and len(result) > 0:
            return result[0]["sale_date"]
    except Exception:
        pass
    return None


# ============================================================
# SYNC CYCLE
# ============================================================

def run_full_sync():
    print_hsep(f"Smokey Dreamz POS Bridge v{SCRIPT_VERSION} — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"  Branch: {BRANCH_ID}  |  Dry Run: {DRY_RUN}  |  Script: v{SCRIPT_VERSION}")
    print_hsep()

    # 1. TEST CONNECTIVITY
    print("\n[CONNECTIVITY TEST]")
    conn_results = test_connection()
    print()
    if not conn_results["aronium"]:
        diagnostic_banner("SYNC ABORTED", False, "Aronium DB is unreachable")
        return {"status": "error", "message": "Aronium connection failed"}
    if not conn_results["supabase"]:
        diagnostic_banner("SYNC ABORTED", False, "Supabase API is unreachable")
        return {"status": "error", "message": "Supabase connection failed"}

    # 2. SCHEMA DIAGNOSTIC — dump Document + DocumentType tables
    print("\n[SCHEMA DIAGNOSTIC]")
    try:
        conn_diag = sqlite3.connect(f"file:{ARONIUM_DB_PATH}?mode=ro", uri=True)
        conn_diag.row_factory = sqlite3.Row
        c_diag = conn_diag.cursor()
        dump_schema_sample(c_diag, "Document", 3)
        dump_schema_sample(c_diag, "DocumentType", 5)
        dump_schema_sample(c_diag, "PosOrder", 2)
        dump_schema_sample(c_diag, "Customer", 3)
        conn_diag.close()
    except sqlite3.Error as e:
        print(f"  ⚠ Schema diagnostic error: {e}")

    # 2b. DOCUMENT TYPE DIAGNOSTIC — past 24h
    print("\n[DOCUMENT TYPE DIAGNOSTIC]")
    try:
        conn_doc = sqlite3.connect(f"file:{ARONIUM_DB_PATH}?mode=ro", uri=True)
        conn_doc.row_factory = sqlite3.Row
        c_doc = conn_doc.cursor()
        diagnose_documents_24h(c_doc)
        conn_doc.close()
    except sqlite3.Error as e:
        print(f"  ⚠ Document diagnostic error: {e}")

    # 3. SYNC SALES — per-receipt upsert using receipt_id as unique key
    print("\n--- Sales Sync (Receipt-Level Upsert) ---")
    last_sync = get_last_sync_date()
    logger.info(f"Last sync date: {last_sync}")

    aronium_sales = read_aronium_sales(since=last_sync)

    sales_synced = 0
    sales_skipped = 0
    sales_failed = 0

    for sale in aronium_sales:
        try:
            result = upsert_receipt_to_supabase(sale)
            if result is not None:
                sales_synced += 1
            else:
                sales_failed += 1
        except Exception as e:
            logger.error(f"Unexpected error upserting receipt {sale.get('receipt_id','?')}: {e}")
            sales_failed += 1

    status_icon_sales = "✅" if sales_failed == 0 else "⚠"
    print(f"\n  {status_icon_sales} [LOCAL PULSE] {sales_synced} receipts upserted, {sales_failed} failed")

    # [REVENUE ENGINE] — list every invoice synced this cycle
    invoice_numbers = [s.get("receipt_id", "?") for s in aronium_sales]
    if invoice_numbers:
        print(f"  [REVENUE ENGINE] Invoices synced ({len(invoice_numbers)}): {', '.join(invoice_numbers)}")
    else:
        print(f"  [REVENUE ENGINE] No new invoices this cycle")

    # 4. SYNC INVENTORY — auto-catalog + stock updates
    print("\n--- Inventory Sync ---")
    aronium_inventory = read_aronium_inventory()
    inv_result = sync_inventory_to_supabase(aronium_inventory)

    auto_c = inv_result["auto_created"]
    stock_u = inv_result["stock_updated"]
    inv_fail = inv_result["failed"]
    print(f"\n  [AUTO-CATALOG] {auto_c} brand-new products automatically created in Supabase")
    print(f"  [STOCK SYNC] {stock_u} existing item quantities/availabilities adjusted, {inv_fail} failed")

    # 5. SUMMARY (protected — a formatting typo must never kill the loop)
    try:
        summary = {
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sales": {"synced": sales_synced, "skipped": sales_skipped, "failed": sales_failed},
            "inventory": inv_result,
        }
        print_hsep("SYNC CYCLE COMPLETE")
        print(f"  {json.dumps(summary, indent=2)}")
        print_hsep()
    except Exception as e:
        logger.error(f"Summary assembly error (non-fatal): {e}")
        summary = {"status": "partial", "error": str(e), "timestamp": datetime.now(timezone.utc).isoformat()}

    return summary


# ============================================================
# MAIN LOOP (30-minute interval)
# ============================================================

def main():
    global DRY_RUN

    # Pick up --dry-run flag anywhere in args
    if "--dry-run" in sys.argv:
        DRY_RUN = True
        sys.argv.remove("--dry-run")

    # Single-run commands
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()

        if cmd == "test":
            results = test_connection()
            print("\n" + "=" * 40)
            print(f"CONNECTION TEST RESULTS — v{SCRIPT_VERSION}")
            print("=" * 40)
            print(f"Script version: {SCRIPT_VERSION}")
            print(f"Branch:         {BRANCH_ID}")
            print(f"Aronium SQLite: {'OK' if results['aronium'] else 'FAILED'}")
            print(f"Supabase:       {'OK' if results['supabase'] else 'FAILED'}")
            if results["errors"]:
                print("\nErrors:")
                for err in results["errors"]:
                    print(f"  - {err}")
            print("=" * 40)
            return 0 if results["aronium"] and results["supabase"] else 1

        elif cmd == "sync":
            result = run_full_sync()
            return 0 if result["status"] == "success" else 1

        elif cmd == "dry-run":
            DRY_RUN = True
            result = run_full_sync()
            return 0 if result["status"] == "success" else 1

        elif cmd == "loop":
            # Run continuously
            pass
        else:
            print(f"Unknown command: {cmd}")
            print("Usage: python randpark-bridge.py [test|sync|dry-run|loop]")
            return 1

    # ── Continuous 1-minute loop ──
    cycle = 0
    print_hsep(f"RANDPARK BRIDGE v{SCRIPT_VERSION} — 1-MINUTE LOOP MODE")
    print("  Press Ctrl+C to stop")
    print_hsep()

    while True:
        cycle += 1
        now = datetime.now(timezone.utc)
        print(f"\n{'#' * 64}")
        print(f"  🚀 CYCLE #{cycle}  —  v{SCRIPT_VERSION}  —  {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"{'#' * 64}")

        try:
            result = run_full_sync()
        except KeyboardInterrupt:
            print("\n\nLoop stopped by user.")
            return 0
        except Exception as e:
            logger.error(f"Unhandled error in cycle {cycle}: {e}")
            print(f"\n  ❌ [FATAL] Unhandled error: {e}")

        # ── Countdown to next sync (60 seconds, print every 10s) ──
        next_sync = datetime.now(timezone.utc) + timedelta(seconds=SYNC_INTERVAL)
        print(f"\n  ⏳ Next sync at {next_sync.strftime('%H:%M:%S')} UTC")
        print(f"  {'─' * 40}")

        for remaining in range(SYNC_INTERVAL, 0, -10):
            secs = remaining
            print(f"\r  Next sync in {secs:02d}s  ", end="", flush=True)
            try:
                time.sleep(10)
            except KeyboardInterrupt:
                print("\n\nLoop stopped by user.")
                return 0

        print()  # newline after countdown


if __name__ == "__main__":
    sys.exit(main())
