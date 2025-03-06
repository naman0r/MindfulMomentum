# to configure the backend, database, etc. 
# config.py


import os
from dotenv import load_dotenv
from supabase import create_client
from flask_jwt_extended import JWTManager

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not JWT_SECRET_KEY:
    raise ValueError("Error: Supabase URL, key, or JWT secret key is not set in .env file")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Supabase connected!")
