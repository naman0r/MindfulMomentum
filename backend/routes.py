from flask import Blueprint, request, jsonify
from config import supabase
from datetime import datetime, timedelta

routes = Blueprint("routes", __name__)

### ✅ 1. GET All Habits for a User
@routes.route("/api/habits/<user_id>", methods=["GET"])
def get_habits(user_id):
    response = supabase.from_("habits").select("*").eq("user_id", user_id).execute()
    return jsonify(response.data)


### ✅ 2. ADD a New Habit (with reminder_time, description)
@routes.route("/api/habits", methods=["POST"])
def add_habit():
    data = request.json
    new_habit = {
        "user_id": data["user_id"],
        "title": data["title"],
        "description": data.get("description", ""),
        "reminder_time": data.get("reminder_time", None),
        "created_at": datetime.utcnow().isoformat(),
        "completed_dates": [],
        "streak": 0
    }
    response = supabase.from_("habits").insert(new_habit).execute()
    return jsonify(response.data)


### ✅ 3. MARK Habit as Completed (updates `completed_dates` and `streak`)
@routes.route("/api/habits/complete", methods=["POST"])
def complete_habit():
    data = request.json
    habit_id = data["habit_id"]

    # Fetch the habit's completed dates
    response = supabase.from_("habits").select("completed_dates, streak").eq("id", habit_id).execute()

    if response.data:
        habit = response.data[0]
        completed_dates = habit["completed_dates"]
        streak = habit["streak"]

        # Get today's date
        today = datetime.utcnow().strftime("%Y-%m-%d")

        # Avoid duplicate completion for today
        if today not in completed_dates:
            completed_dates.append(today)

            # Check if the last completion was yesterday to continue the streak
            if completed_dates and (datetime.strptime(completed_dates[-2], "%Y-%m-%d") == datetime.utcnow() - timedelta(days=1)):
                streak += 1
            else:
                streak = 1  # Reset streak if missed a day

            # Update Supabase
            supabase.from_("habits").update({"completed_dates": completed_dates, "streak": streak}).eq("id", habit_id).execute()
            return jsonify({"message": "Habit marked as completed!", "streak": streak})

    return jsonify({"error": "Habit not found"}), 404


### ✅ 4. GET All Journal Entries for a User
@routes.route("/api/journal/<user_id>", methods=["GET"])
def get_journal_entries(user_id):
    response = supabase.from_("journal").select("*").eq("user_id", user_id).execute()
    return jsonify(response.data)


### ✅ 5. ADD a New Journal Entry
@routes.route("/api/journal", methods=["POST"])
def add_journal_entry():
    data = request.json
    new_entry = {
        "user_id": data["user_id"],
        "title": data["title"],
        "content": data["content"],
        "date": datetime.utcnow().isoformat(),
    }
    response = supabase.from_("journal").insert(new_entry).execute()
    return jsonify(response.data)


### ✅ 6. GET Productivity Tasks for a User
@routes.route("/api/productivity/<user_id>", methods=["GET"])
def get_tasks(user_id):
    response = supabase.from_("tasks").select("*").eq("user_id", user_id).execute()
    return jsonify(response.data)


### ✅ 7. ADD a New Productivity Task
@routes.route("/api/productivity", methods=["POST"])
def add_task():
    data = request.json
    new_task = {
        "user_id": data["user_id"],
        "title": data["title"],
        "due_date": data["due_date"],
        "priority": data["priority"],
        "completed": False,
    }
    response = supabase.from_("tasks").insert(new_task).execute()
    return jsonify(response.data)
