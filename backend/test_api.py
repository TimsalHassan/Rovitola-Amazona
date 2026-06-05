"""Quick API test script for all backend endpoints."""
import requests
import json

BASE = "http://127.0.0.1:8000"
PASS = []
FAIL = []

def test(name, method, url, expected_status=200, **kwargs):
    try:
        r = getattr(requests, method)(url, timeout=10, **kwargs)
        status = "PASS" if r.status_code == expected_status else "FAIL"
        if status == "PASS":
            PASS.append(name)
        else:
            FAIL.append(f"{name} (got {r.status_code}, expected {expected_status})")
            try:
                print(f"  [{status}] {name}: {r.status_code} -> {r.json()}")
            except Exception:
                print(f"  [{status}] {name}: {r.status_code} -> {r.text[:200]}")
            return r
        print(f"  [{status}] {name}: {r.status_code}")
        return r
    except Exception as e:
        FAIL.append(f"{name} (Exception: {e})")
        print(f"  [FAIL] {name}: {e}")
        return None

print("=" * 60)
print("TESTING BACKEND API ENDPOINTS")
print("=" * 60)

# 1. Restaurant
print("\n--- Restaurant ---")
test("GET /api/restaurant/info/", "get", f"{BASE}/api/restaurant/info/")
test("POST /api/restaurant/delivery-check/", "post", f"{BASE}/api/restaurant/delivery-check/",
     json={"latitude": 60.98, "longitude": 25.66})

# 2. Menu
print("\n--- Menu ---")
test("GET /api/menu/categories/", "get", f"{BASE}/api/menu/categories/")
test("GET /api/menu/categories/?language=fi", "get", f"{BASE}/api/menu/categories/?language=fi")
r = test("GET /api/menu/items/", "get", f"{BASE}/api/menu/items/")
items = r.json() if r else []
if items:
    item_id = items[0]["id"]
    test(f"GET /api/menu/items/{item_id}/", "get", f"{BASE}/api/menu/items/{item_id}/")
    test(f"GET /api/menu/items/{item_id}/?language=fi", "get", f"{BASE}/api/menu/items/{item_id}/?language=fi")
test("GET /api/menu/extras/", "get", f"{BASE}/api/menu/extras/")
test("GET /api/menu/extra-options/", "get", f"{BASE}/api/menu/extra-options/")

# 3. Reviews
print("\n--- Reviews ---")
test("GET /api/reviews/", "get", f"{BASE}/api/reviews/")
test("POST /api/reviews/create/ (unauth)", "post", f"{BASE}/api/reviews/create/",
     expected_status=401, json={"rating": 5, "text": "Great!"})

# 4. Auth - try login first, register only if needed
print("\n--- Auth ---")
test("POST /api/auth/login/ (wrong pass)", "post", f"{BASE}/api/auth/login/",
     expected_status=401, json={"email": "nope@nope.com", "password": "wrong"})

token = None
# Try login with existing test user
r = requests.post(f"{BASE}/api/auth/login/",
                  json={"email": "apitest2@test.com", "password": "testpass123"}, timeout=10)
if r.status_code == 200:
    token = r.json().get("token")
    print(f"  [INFO] Logged in existing test user, token: {token[:20]}...")
    PASS.append("POST /api/auth/login/ (existing user)")
else:
    # Register new test user
    r = test("POST /api/auth/register/", "post", f"{BASE}/api/auth/register/",
             expected_status=201,
             json={"name": "API Test 2", "email": "apitest2@test.com", "phone": "0402222222",
                   "password": "testpass123", "confirm_password": "testpass123"})
    if r and r.status_code == 201:
        token = r.json().get("token")
        print(f"    -> Got token: {token[:20]}...")

if token:
    headers = {"Authorization": f"Token {token}"}
    
    # Profile & Addresses
    print("\n--- Auth (authenticated) ---")
    test("GET /api/auth/profile/", "get", f"{BASE}/api/auth/profile/", headers=headers)
    test("GET /api/auth/addresses/", "get", f"{BASE}/api/auth/addresses/", headers=headers)

    # 5. Cart
    print("\n--- Cart ---")
    test("GET /api/cart/", "get", f"{BASE}/api/cart/", headers=headers)
    
    if items:
        r = test("POST /api/cart/add/", "post", f"{BASE}/api/cart/add/", headers=headers,
                 json={"menu_item_id": items[0]["id"], "quantity": 2, "selected_option_ids": []})
        
        if r and r.status_code == 200:
            cart_data = r.json()
            print(f"    -> Cart items: {cart_data.get('total_items', 0)}, subtotal: {cart_data.get('subtotal', '0')}")
            
            if cart_data.get("items"):
                cart_item_id = cart_data["items"][0]["id"]
                test(f"PATCH /api/cart/items/{cart_item_id}/", "patch",
                     f"{BASE}/api/cart/items/{cart_item_id}/", headers=headers,
                     json={"quantity": 3})
                test(f"DELETE /api/cart/items/{cart_item_id}/", "delete",
                     f"{BASE}/api/cart/items/{cart_item_id}/", headers=headers)

    # 6. Orders
    print("\n--- Orders ---")
    test("GET /api/orders/", "get", f"{BASE}/api/orders/", headers=headers)
    
    if items:
        order_data = {
            "order_type": "pickup",
            "payment_method": "cash_on_delivery",
            "delivery_address": "",
            "order_notes": "Test order from API test",
            "subtotal": "8.50",
            "delivery_charge": "0.00",
            "discount_amount": "0.00",
            "total": "8.50",
            "items": [{
                "menu_item_name": items[0].get("name", "Test Item"),
                "menu_item_name_fi": items[0].get("name_fi", ""),
                "quantity": 1,
                "base_price": "8.50",
                "total_price": "8.50",
                "special_instruction": "",
                "selected_options": []
            }]
        }
        r = test("POST /api/orders/create/", "post", f"{BASE}/api/orders/create/",
                 expected_status=201, headers=headers, json=order_data)
        
        if r and r.status_code == 201:
            order_num = r.json().get("order_number")
            print(f"    -> Order created: {order_num}")
            test(f"GET /api/orders/{order_num}/", "get",
                 f"{BASE}/api/orders/{order_num}/", headers=headers)

    # 7. Reviews (authenticated)
    print("\n--- Reviews (authenticated) ---")
    test("POST /api/reviews/create/", "post", f"{BASE}/api/reviews/create/",
         expected_status=201, headers=headers,
         json={"rating": 4, "text": "API test review"})

    # 8. Logout (last)
    print("\n--- Logout ---")
    test("POST /api/auth/logout/", "post", f"{BASE}/api/auth/logout/", headers=headers)

# Summary
print("\n" + "=" * 60)
print(f"RESULTS: {len(PASS)} passed, {len(FAIL)} failed")
if FAIL:
    print("\nFailed tests:")
    for f in FAIL:
        print(f"  - {f}")
else:
    print("\nAll tests passed!")
print("=" * 60)
