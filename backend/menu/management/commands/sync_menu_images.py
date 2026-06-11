# scripts/download_menu_images.py

import os
import re
import time
import requests
import cloudinary
import cloudinary.uploader

# ── Cloudinary config ─────────────────────────────────────────────────────────

cloudinary.config(
    cloud_name="YOUR_CLOUD_NAME",
    api_key="YOUR_API_KEY",
    api_secret="YOUR_API_SECRET",
)

GOOGLE_API_KEY   = "YOUR_GOOGLE_API_KEY"
SEARCH_ENGINE_ID = "YOUR_CSE_ID"
DOWNLOAD_DIR     = "menu_images"

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# ── Paste MENU_ITEMS here (or import from populate_db.py) ────────────────────

from populate_db import MENU_ITEMS   # or paste the list directly

# ── Slug logic ────────────────────────────────────────────────────────────────

def to_slug(name: str) -> str:
    """
    "8. Kebab pizza"            → "kebab_pizza"
    "27. Fantasy (3 fillings)"  → "fantasy_3_fillings"   ← variants keep suffix
    "V1. Vöner pizza"           → "voner_pizza"
    "U6. Harskan Power"         → "harskan_power"
    """
    # Remove leading number/letter prefix:  "8. ", "V1. ", "U6. "
    name = re.sub(r'^[\w]+\.\s*', '', name)
    # Normalize accented chars
    name = name.replace('ö', 'o').replace('ä', 'a').replace('å', 'a')
    # Keep only alphanumerics + spaces, lowercase
    name = re.sub(r'[^a-z0-9\s]', '', name.lower())
    # Collapse spaces → underscore
    return re.sub(r'\s+', '_', name.strip())


def search_term(item: dict) -> str:
    """Build a good Google image search query for the item."""
    base = re.sub(r'^[\w]+\.\s*', '', item["name"])   # strip number prefix
    # Remove variant suffixes like "(3 fillings)" for generic items
    base = re.sub(r'\(.*?\)', '', base).strip()
    desc = item.get("description", "")
    if desc:
        return f"{base} {desc} food dish"
    return f"{base} food dish"

# ── Deduplicate: one image per unique dish, skip variant duplicates ───────────

def unique_items(items):
    """
    "27. Fantasy (1 filling)", "(2 fillings)" etc. → download once as "fantasy"
    """
    seen_slugs = set()
    for item in items:
        slug = to_slug(item["name"])
        # For variants, collapse to base slug (strip trailing _N_fillings etc.)
        base_slug = re.sub(r'_\d+_filling.*$', '', slug)
        if base_slug in seen_slugs:
            continue
        seen_slugs.add(base_slug)
        yield item, base_slug

# ── Download + upload ─────────────────────────────────────────────────────────

def search_image_url(query: str) -> str | None:
    try:
        resp = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": GOOGLE_API_KEY,
                "cx": SEARCH_ENGINE_ID,
                "q": query,
                "searchType": "image",
                "imgType": "photo",
                "imgSize": "large",
                "num": 1,
            },
            timeout=10,
        )
        items = resp.json().get("items", [])
        return items[0]["link"] if items else None
    except Exception as e:
        print(f"  Search error: {e}")
        return None


def download_image(url: str, filepath: str) -> bool:
    try:
        r = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()
        with open(filepath, "wb") as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"  Download failed: {e}")
        return False


def upload_to_cloudinary(filepath: str, slug: str) -> str | None:
    try:
        result = cloudinary.uploader.upload(
            filepath,
            public_id=slug,
            folder="menu",
            overwrite=True,
        )
        return result["secure_url"]
    except Exception as e:
        print(f"  Cloudinary upload failed: {e}")
        return None

# ── Main ──────────────────────────────────────────────────────────────────────

failed = []

for item, slug in unique_items(MENU_ITEMS):
    filepath = os.path.join(DOWNLOAD_DIR, f"{slug}.jpg")
    print(f"\n→ [{item['category']}] {item['name']}  (slug: {slug})")

    # Skip download if already on disk
    if not os.path.exists(filepath):
        query = search_term(item)
        print(f"  Searching: {query}")
        url = search_image_url(query)
        if not url:
            print("  ✗ No image found")
            failed.append(item["name"])
            continue
        print(f"  Found: {url[:70]}...")
        if not download_image(url, filepath):
            failed.append(item["name"])
            continue
    else:
        print("  Already on disk, skipping download")

    cloudinary_url = upload_to_cloudinary(filepath, slug)
    if cloudinary_url:
        print(f"  ✓ {cloudinary_url}")
    else:
        failed.append(item["name"])

    time.sleep(1.1)  # ~100 req/day free tier — stays safely under burst limit

print(f"\n{'='*60}")
print(f"Failed ({len(failed)}): {failed or 'none'}")