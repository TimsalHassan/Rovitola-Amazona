import random, string, time

def generate_order_number():
    ts     = str(int(time.time()))[-4:]   # last 4 digits of timestamp
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{ts}{suffix}"