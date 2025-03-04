# to configure the backend, database, etc. 


import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

print("Supabase URL:", SUPABASE_URL)
print("Supabase Key:", SUPABASE_KEY)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Error: Supabase URL or key is not set in .env file")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

