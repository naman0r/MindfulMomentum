# to configure the backend, database, etc.
# config.py


import json
import os

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# This key bypasses RLS, so it must be the service_role key, not the anon key.
# Kept the env var name for backwards compat with existing Render config; the
# new SUPABASE_SERVICE_ROLE_KEY name takes precedence if both are set.
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not JWT_SECRET_KEY:
    raise ValueError("Error: Supabase URL, key, or JWT secret key is not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# Initialize Firebase Admin so the backend can verify Google sign-in ID tokens.
# The app fails closed: if credentials aren't provided, /api/login will reject
# every request rather than fall back to trusting the client.
def _init_firebase_admin():
    if firebase_admin._apps:
        return

    raw = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if raw:
        try:
            cred = credentials.Certificate(json.loads(raw))
        except (ValueError, json.JSONDecodeError) as e:
            raise ValueError(f"FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: {e}")
    elif cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        print(
            "WARNING: Firebase Admin credentials not configured. "
            "Set FIREBASE_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS). "
            "Login will be rejected until this is set."
        )
        return

    firebase_admin.initialize_app(cred)


_init_firebase_admin()
