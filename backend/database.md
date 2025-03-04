# Database readme:

- supabase
- created supabase client in config.py
-

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
google_id TEXT UNIQUE NOT NULL,
email TEXT UNIQUE NOT NULL,
name TEXT,
profile_picture TEXT,
last_logged_in TIMESTAMP DEFAULT NOW()
);
