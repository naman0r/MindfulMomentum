# api.py, most routes. 

from flask import Blueprint, request, jsonify, Flask, make_response
from config import supabase
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
from cryptography.fernet import Fernet, InvalidToken


api = Blueprint("api", __name__)

# --- Encryption Setup ---
# Load the encryption key from environment variables
JOURNAL_ENCRYPTION_KEY = os.getenv("JOURNAL_ENCRYPTION_KEY")
if not JOURNAL_ENCRYPTION_KEY:
    print("WARNING: JOURNAL_ENCRYPTION_KEY environment variable not set. Journal encryption disabled.")
    fernet = None
else:
    try:
        fernet = Fernet(JOURNAL_ENCRYPTION_KEY.encode())
    except ValueError as e:
        print(f"ERROR: Invalid JOURNAL_ENCRYPTION_KEY format. Please generate a valid Fernet key. {e}")
        fernet = None

def encrypt_content(content):
    if fernet and content:
        return fernet.encrypt(content.encode('utf-8')).decode('utf-8')
    return content # Return original content if encryption is disabled or content is empty

def decrypt_content(encrypted_content):
    if fernet and encrypted_content:
        try:
            # Ensure it's bytes before decrypting
            if isinstance(encrypted_content, str):
                encrypted_content_bytes = encrypted_content.encode('utf-8')
            else:
                encrypted_content_bytes = encrypted_content # Assume it's already bytes if not string
            
            decrypted_bytes = fernet.decrypt(encrypted_content_bytes)
            return decrypted_bytes.decode('utf-8')
        except (InvalidToken, TypeError, ValueError) as e:
            print(f"Decryption Error: {e}. Returning placeholder.")
            return "[Content could not be decrypted]"
    return encrypted_content # Return original (potentially encrypted) content if decryption is disabled or content is empty
# --- End Encryption Setup ---


# User Routes
""" @api.route("/api/login", methods=["GET"]) # lowkey unprotected route, just helps me get the info of all users. 
def get_users(): 
    try:
        response = supabase.from_("users").select("*").execute()
        return jsonify({"message": "Users fetched successfully", "users": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500 """



# trying to implement JWT with login. this is the entrypoint where it returns a JWT upon login. 
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
            user = existing_user[0]
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
            user = response.data[0]

        # Generate JWT
        access_token = create_access_token(identity=google_id)
        return jsonify({"message": "User logged in", "user": user, "access_token": access_token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500





## =============================== HABITS ===================================



# unprotected habits route (debugging purposes only, not for prod)
""" @api.route("/api/get/habits/all", methods=["GET"])
def get_all_habits(): 
    try: 
    
        response = supabase.from_("habits").select("*").execute()
        journals = response.data
        return jsonify({"all habits" : journals}), 200
    
    except Exception as e: 
        return jsonify({"error" : str(e)}), 500 """
    


# for habits: 
@api.route("/api/add/habit", methods=["POST"])
@jwt_required()
def add_habit():
    google_id = get_jwt_identity()
    data = request.json
    print(f"Received habit data: {data}")  # Debugging

    if not data.get("title"):
        print("Error: Missing title field")
        return jsonify({"error": "Title is required"}), 400
    
    reminder_time  = data.get("reminder_time")
    if reminder_time == "":
        reminder_time = None
        

    new_habit = {
        "google_id": google_id,
        "title": data["title"],
        "description": data.get("description", ""),
        "frequency": data.get("frequency", "daily"),
        "days_of_week": data.get("days_of_week", []),
        "reminder_time": reminder_time, 
        "created_at": datetime.utcnow().isoformat(),
        "completed_dates": [],
        "streak": 0,
        "goal": data.get("goal", 1),
        "progress": 0
    }

    try:
        response = supabase.from_("habits").insert(new_habit).execute()
        print("Habit added successfully:", response.data)  # Debugging
        return jsonify({"message": "Habit added successfully"}), 201
    except Exception as e:
        print("Error adding habit:", str(e))
        return jsonify({"error": str(e)}), 500


@api.route("/api/get/habits", methods=["GET"])
@jwt_required()
def get_habits():
    
    google_id = get_jwt_identity()  # Extract user identity from JWT wtffffffffff this is cool but is it secure? 
    
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

@api.route("/api/delete/habit/<id>", methods=["DELETE"])
@jwt_required()
def delete_habit(id):
    try:
        
        google_id = get_jwt_identity() # extract google id from identity 
        # Check if the habit exists
        response = supabase.from_("habits").select("*").eq("id", id).eq("google_id", google_id).execute()
        
        if not response.data:
            return jsonify({"error": "Habit not found"}), 404

        # Delete the habit
        supabase.from_("habits").delete().eq("id", id).eq("google_id", google_id).execute()
        
        return jsonify({"message": "Habit deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




##=================  JOURNAL ROUTES ==========================================



## for Journal entries: 



# get ALL journals (unprotected route, for development purposes only )
""" @api.route("/api/get/journals/all", methods=["GET"])
def get_all_entries(): 
    try: 
        
        response = supabase.from_("journals").select("*").execute()
        journals = response.data
        return jsonify({"all journals" : journals}), 200
        
    except Exception as e: 
        return jsonify({"error" : str(e)}), 500 """



# get a user's journals. 
@api.route("/api/get/journals", methods = ["GET"])
@jwt_required()
def get_users_journals():
    try: 
        google_id = get_jwt_identity()
        response = supabase.from_("journals").select("*").eq("google_id", google_id).order('created_at', desc=True).execute()
        journals = response.data

        # Decrypt content for each journal
        if journals:
            for journal in journals:
                journal['content'] = decrypt_content(journal.get('content'))

        return jsonify({"journals": journals}), 200
    except Exception as e: 
        print(f"Error in get_users_journals: {e}") # Added logging
        return jsonify({"error": str(e)}), 500
    
    
    
    
@api.route("/api/add/journal", methods=["POST"])
@jwt_required()
def add_journal_entry(): 
    try: 
        google_id = get_jwt_identity()
        data = request.json
        
        title = data.get("title")
        content = data.get("content") # Plaintext content from request
        mood = data.get("mood", "neutral")
        tags = data.get("tags", [])
        attachments = data.get("attachments", [])
        privacy = data.get("privacy", "private")

        if not title or not content:
            return jsonify({"error": "Missing required fields"}), 400

        # Encrypt the content before storing
        encrypted_content = encrypt_content(content)

        new_entry = {
            "google_id": google_id,
            "title": title,
            "content": encrypted_content, # Store encrypted content
            "mood": mood,
            "tags": tags,
            "attachments": attachments,
            "privacy": privacy,
            "created_at": datetime.utcnow().isoformat(),
            "last_edited_at": datetime.utcnow().isoformat()
        }

        response = supabase.from_("journals").insert(new_entry).execute()
        
        # Decrypt content before sending back in response (optional, but good practice)
        if response.data:
             response.data[0]['content'] = decrypt_content(response.data[0].get('content'))
             
        return jsonify({"message": "Journal entry added successfully", "journal": response.data}), 201

    except Exception as e:
        print(f"Error in add_journal_entry: {e}") # Added logging
        return jsonify({"error": str(e)}), 500


@api.route("/api/delete/journal/<id>", methods=["DELETE"])
@jwt_required()
def delete_entry(id):
    try: 
        google_id = get_jwt_identity()

        #  Step 1: Fetch journal entry to verify ownership
        response = supabase.from_("journals").select("google_id").eq("id", id).execute()
        journal_entry_data = response.data

        if not journal_entry_data:
            return jsonify({"error": "Journal entry not found"}), 404

        if journal_entry_data[0]["google_id"] != google_id:
            return jsonify({"error": "Unauthorized: You cannot delete this journal entry"}), 403

        # Step 2: Delete the journal entry
        delete_response = supabase.from_("journals").delete().eq("id", id).execute()

        # Check if deletion might have failed (optional check, depends on supabase-py behavior)
        # if not delete_response.data and delete_response.error: # Adjust based on actual response
        #     return jsonify({"error": f"Failed to delete journal entry: {delete_response.error.message}"}), 500

        return jsonify({"message": "Journal entry deleted successfully", "deleted_id": id}), 200

    except Exception as e: 
        print(f"Error in delete_entry: {e}") # Added logging
        return jsonify({"error": str(e)}), 500

        
@api.route('/api/get/journal/<id>', methods=["GET"])
@jwt_required()
def get_entry_by_id(id):
    try: 
        google_id = get_jwt_identity()
        response = supabase.from_("journals").select("*").eq("id", id).execute()
        journal_entry_list = response.data # Renamed to avoid confusion

        if not journal_entry_list:
            return jsonify({"error": "Journal entry not found"}), 404
            
        journal_entry = journal_entry_list[0] # Get the dictionary

        if journal_entry["google_id"] != google_id:
            return jsonify({"error": "Unauthorized: You cannot view this journal entry!"}), 403
        
        # Decrypt the content before returning
        journal_entry['content'] = decrypt_content(journal_entry.get('content'))
        
        return jsonify({"journal" : journal_entry }), 200
        
    except Exception as e:
        print(f"Error in get_entry_by_id: {e}") # Added logging
        return jsonify({"error": str(e)}), 500
    
    

    
# ================================ TASKS ROUTES =================================

# removing uprotected route from prod
""" 
@api.route('/api/get/tasks/all', methods=["GET"])
def get_all_tasks_unprotected(): 
    try: 
        response = supabase.from_("tasks").select("*").execute()
        tasks  = response.data
        return jsonify({"tasks": tasks}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500 """




@api.route("/api/get/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        google_id = get_jwt_identity()  # Extract user identity from JWT
        response = supabase.from_("tasks").select("*").eq("google_id", google_id).execute()
        tasks = response.data
        return jsonify({"tasks": tasks}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/api/add/task", methods=["POST"])
@jwt_required()
def add_task():
    try:
        google_id = get_jwt_identity()  # Extract user identity from JWT
        data = request.json
        new_task = {
            "google_id": google_id,
            "title": data["title"],
            "description": data.get("description", ""),
            "due_date": data.get("due_date"),
            "priority": data.get("priority", 5),
            "completed": False,
        }
        response = supabase.from_("tasks").insert(new_task).execute()
        return jsonify({"message": "Task added successfully", "task": response.data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/api/delete/task/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    try:
        google_id = get_jwt_identity()  # Extract user identity from JWT

        # Fetch the task first
        response = supabase.from_("tasks").select("*").eq("id", task_id).execute()
        task = response.data

        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        if task[0]["google_id"] != google_id:
            return jsonify({"error": "You do not have permission to delete this task."}), 403

        # Now, safely delete the task
        supabase.from_("tasks").delete().eq("id", task_id).execute()
        return jsonify({"message": "Task deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/api/toggle/task/<task_id>", methods=["PATCH"])
@jwt_required()
def complete_task(task_id):
    try:
        google_id = get_jwt_identity()  # Extract user identity from JWT

        # Fetch the task first
        response = supabase.from_("tasks").select("*").eq("id", task_id).execute()
        task = response.data

        if not task:
            return jsonify({"error": "Task not found"}), 404
        
        if task[0]["google_id"] != google_id:
            return jsonify({"error": "You do not have permission to modify this task."}), 403
        
        
        if task[0]["completed"] == True :
            supabase.from_("tasks").update({"completed": False}).eq("id", task_id).execute()
        else: 
             # Now, safely update the task
            supabase.from_("tasks").update({"completed": True}).eq("id", task_id).execute()
            
        return jsonify({"message": "Task marked as completed"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
