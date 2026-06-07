import requests
import json

# Test API for all items
r_all = requests.get('http://localhost:8000/api/menu/items/?page_size=1000')
data = r_all.json()

# Count by category
cats = {}
for item in data.get('results', []):
    cat = item['category_name']
    cats[cat] = cats.get(cat, 0) + 1

print("All items by category:")
for cat in sorted(cats.keys()):
    print(f"  {cat}: {cats[cat]}")

print(f"\nTotal items in first response: {len(data.get('results', []))}")

# Test specific beverages query
r_bev = requests.get('http://localhost:8000/api/menu/items/?category=beverages&page_size=100')
bev_data = r_bev.json()
print(f"Beverages specific query: {len(bev_data.get('results', []))} items")
