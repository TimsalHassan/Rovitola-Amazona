#!/usr/bin/env python
import requests
import json

# Test the API with large page_size to get all items
resp = requests.get('http://localhost:8000/api/menu/items/?page_size=1000')
data = resp.json()

# Count items by category
categories = {}
for item in data.get('results', []):
    cat = item['category_name']
    if cat not in categories:
        categories[cat] = []
    categories[cat].append({
        'id': item['id'],
        'name': item['name'],
        'is_menu_item': item.get('is_menu_item', True)
    })

print("=== Items by Category ===")
for cat_name in sorted(categories.keys()):
    items = categories[cat_name]
    print(f"\n{cat_name}: {len(items)} items")
    for item in items[:3]:  # Show first 3
        print(f"  - {item['id']}: {item['name']} (is_menu_item={item['is_menu_item']})")
    if len(items) > 3:
        print(f"  ... and {len(items) - 3} more")

print(f"\nTotal items in page 1: {len(data.get('results', []))}")
print(f"Total count from API: {data.get('count', 0)}")
