from flask import Blueprint, request, jsonify, Flask, make_response
from config import supabase
from datetime import datetime, timedelta

api = Blueprint("api", __name__)

# User Routes
@api.route("/api/login", methods=["GET"])
def get_users(): 
    try:
        response = supabase.from_("users").select("*").execute()
        return jsonify({"message": "Users fetched successfully", "users": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route("/api/login", methods=["POST"])
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






# for habits: 
@api.route("/api/add/habit", methods=["POST"])
def add_habit():
    data = request.json
    new_habit = {
        "google_id": data["google_id"],
        "title": data["title"],
        "description": data.get("description", ""),
        "frequency": data.get("frequency", "daily"),
        "days_of_week": data.get("days_of_week", []),
        "reminder_time": data.get("reminder_time", None),
        "created_at": datetime.utcnow().isoformat(),
        "completed_dates": [],
        "streak": 0,
        "goal": data.get("goal", 1),
        "progress": 0
    }
    response = supabase.from_("habits").insert(new_habit).execute()
    return jsonify(response.data)

@api.route("/api/get/habits/<google_id>", methods=["GET"])
def get_habits(google_id):
    response = supabase.from_("habits").select("*").eq("google_id", google_id).execute()
    habits = response.data

    today = datetime.utcnow().strftime("%A")  # Get the current day (e.g., "Monday")

    # Filter habits based on frequency
    filtered_habits = []
    for habit in habits:
        if habit["frequency"] == "daily":
            filtered_habits.append(habit)
        elif habit["frequency"] == "weekly" and today in habit["days_of_week"]:
            filtered_habits.append(habit)

    return jsonify(filtered_habits)

@api.route("/api/delete/habit/<google_id>/<id>", methods=["DELETE"])
def delete_habit(google_id, id):
    try:
        # Check if the habit exists
        response = supabase.from_("habits").select("*").eq("id", id).eq("google_id", google_id).execute()
        
        if not response.data:
            return jsonify({"error": "Habit not found"}), 404

        # Delete the habit
        supabase.from_("habits").delete().eq("id", id).eq("google_id", google_id).execute()
        
        return jsonify({"message": "Habit deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



## for Journal entries: 

@api.route("/api/get/journals/<google_id>", methods = ["GET"])
def get_users_journals(google_id):
    
    try: 
        response = supabase.from_("journals").select("*").eq("google_id", google_id).execute()
        journals = response.data
        return jsonify({"journals": journals}), 200
    except Exception as e: 
        return jsonify({"error": e}), 500
    
@api.route("/api/add/journal", methods=["POST"])
def add_journal_entry(): 
    try: 
        data = request.json
        google_id = data.get("google_id")
        title = data.get("title")
        content = data.get("content")
        mood = data.get("mood", "neutral")
        tags = data.get("tags", [])
        attachments = data.get("attachments", [])
        privacy = data.get("privacy", "private")

        if not google_id or not title or not content:
            return jsonify({"error": "Missing required fields"}), 400

        new_entry = {
            "google_id": google_id,
            "title": title,
            "content": content,
            "mood": mood,
            "tags": tags,
            "attachments": attachments,
            "privacy": privacy,
            "created_at": datetime.utcnow().isoformat(),
            "last_edited_at": datetime.utcnow().isoformat()
        }

        response = supabase.from_("journals").insert(new_entry).execute()
        return jsonify({"message": "Journal entry added successfully", "journal": response.data}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
