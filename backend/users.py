## this is the file for the users routes and blueprints in the backend server. 


from flask import Blueprint, request, jsonify
from config import supabase
from datetime import datetime

users = Blueprint("users", __name__)



@users.route("/api/login", methods=["GET"])
def get_users(): 
    try:
        response = supabase.from_("users").select("*").execute()
        return jsonify({"message": "Users fetched successfully", "users": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json
        google_id = data.get("google_id")
        email = data.get("email")
        name = data.get("name")
        profile_picture = data.get("profile_picture")
        last_logged_in = datetime.utcnow().isoformat()

        if not google_id or not email:
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user already exists
        response = supabase.from_("users").select("*").eq("google_id", google_id).execute()
        existing_user = response.data

        if existing_user:
            # Update last_logged_in timestamp
            supabase.from_("users").update({"last_logged_in": last_logged_in}).eq("google_id", google_id).execute()
            return jsonify({"message": "User logged in", "user": existing_user[0]}), 200
        else:
            # Insert new user
            new_user = {
                "google_id": google_id,
                "email": email,
                "name": name,
                "profile_picture": profile_picture,
                "last_logged_in": last_logged_in
            }
            response = supabase.from_("users").insert(new_user).execute()
            return jsonify({"message": "New user added", "user": response.data}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    