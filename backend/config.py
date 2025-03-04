# to configure the backend, database, etc. 


import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Error: Supabase URL or key is not set in .env file")
else: 
    print("Supabase url and key are valid")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("supabase connected!", supabase)

