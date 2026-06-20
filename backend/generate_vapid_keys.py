"""
Generate a VAPID keypair for Web Push, in the exact formats both sides need:
  - VAPID_PRIVATE_KEY: DER (PKCS8) encoded, base64url, no padding
    -> this is what py_vapid / pywebpush's Vapid.from_string() expects.
  - VAPID_PUBLIC_KEY: uncompressed EC point (0x04 || X || Y), base64url
    -> this is what the browser's PushManager.subscribe()
       applicationServerKey expects.

Usage:
    pip install cryptography
    python generate_vapid_keys.py
"""
import base64

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


private_key = ec.generate_private_key(ec.SECP256R1())
public_key = private_key.public_key()

# Private key -> DER-encoded PKCS8, base64url (what py_vapid/pywebpush expects)
private_der = private_key.private_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
)
private_b64 = b64url(private_der)

# Public key -> uncompressed point (0x04 || X || Y), 65 bytes, base64url
# (what the browser's applicationServerKey / VAPID_PUBLIC_KEY expects)
public_raw = public_key.public_bytes(
    encoding=serialization.Encoding.X962,
    format=serialization.PublicFormat.UncompressedPoint,
)
public_b64 = b64url(public_raw)

print("VAPID_PUBLIC_KEY=" + public_b64)
print("VAPID_PRIVATE_KEY=" + private_b64)

# ── Self-test: verify py_vapid can actually load this private key ───────────
try:
    from py_vapid import Vapid
    v = Vapid.from_string(private_key=private_b64)
    print("\n✅ Self-test passed: py_vapid loaded the private key successfully.")
except ImportError:
    print("\n(install py_vapid to run the self-test: pip install py_vapid)")
except Exception as e:
    print(f"\n❌ Self-test FAILED: {e}")