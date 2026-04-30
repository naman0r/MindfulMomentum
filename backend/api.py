# api.py, most routes.

import logging
import os
from calendar import monthrange
from datetime import datetime

import firebase_admin
from cryptography.fernet import Fernet, InvalidToken
from firebase_admin import auth as firebase_auth
from firebase_admin.exceptions import FirebaseError
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from config import supabase

logger = logging.getLogger(__name__)

api = Blueprint("api", __name__)

# --- Encryption Setup ---
JOURNAL_ENCRYPTION_KEY = os.getenv("JOURNAL_ENCRYPTION_KEY")
if not JOURNAL_ENCRYPTION_KEY:
    logger.warning("JOURNAL_ENCRYPTION_KEY not set. Journal encryption disabled.")
    fernet = None
else:
    try:
        fernet = Fernet(JOURNAL_ENCRYPTION_KEY.encode())
    except ValueError as e:
        logger.error("Invalid JOURNAL_ENCRYPTION_KEY format: %s", e)
        fernet = None


def encrypt_content(content):
    if fernet and content:
        return fernet.encrypt(content.encode("utf-8")).decode("utf-8")
    return content


def decrypt_content(encrypted_content):
    if fernet and encrypted_content:
        try:
            if isinstance(encrypted_content, str):
                encrypted_content_bytes = encrypted_content.encode("utf-8")
            else:
                encrypted_content_bytes = encrypted_content
            return fernet.decrypt(encrypted_content_bytes).decode("utf-8")
        except (InvalidToken, TypeError, ValueError) as e:
            logger.warning("Decryption failed: %s", e)
            return "[Content could not be decrypted]"
    return encrypted_content
# --- End Encryption Setup ---


LAUNCHPAD_TRACKER_TYPES = {"checkbox", "number", "rating"}


def parse_launchpad_month(month_value):
    if not month_value:
        base_date = datetime.utcnow().date().replace(day=1)
    else:
        try:
            base_date = datetime.strptime(month_value, "%Y-%m").date().replace(day=1)
        except ValueError:
            return None, None, "Month must be in YYYY-MM format"

    last_day = monthrange(base_date.year, base_date.month)[1]
    month_start = base_date.isoformat()
    month_end = base_date.replace(day=last_day).isoformat()
    return month_start, month_end, None


def normalize_tracker_type(tracker_type):
    if tracker_type not in LAUNCHPAD_TRACKER_TYPES:
        return None
    return tracker_type


def _server_error(log_message, exc):
    logger.exception("%s: %s", log_message, exc)
    return jsonify({"error": "Internal server error"}), 500


# --- User Routes ---

@api.route("/api/login", methods=["POST"])
def login():
    """Exchange a Firebase ID token for a short-lived backend JWT.

    The client must send a Firebase ID token obtained via the Firebase web SDK
    (await result.user.getIdToken()). The previous version of this endpoint
    trusted a client-supplied google_id, which let any caller mint a token for
    any user. Do not reintroduce that behaviour.
    """
    try:
        data = request.get_json(silent=True) or {}
        id_token = data.get("id_token")
        if not id_token:
            return jsonify({"error": "id_token is required"}), 400

        if not firebase_admin._apps:
            logger.error("Login attempted but Firebase Admin is not initialized.")
            return jsonify({"error": "Auth not configured on server"}), 503

        try:
            decoded = firebase_auth.verify_id_token(id_token)
        except (FirebaseError, ValueError) as e:
            logger.info("Rejected login: %s", e)
            return jsonify({"error": "Invalid Firebase ID token"}), 401
        except Exception as e:
            # Catches transport / cert-fetch / unexpected auth errors so a bad
            # token doesn't masquerade as a 500.
            logger.exception("verify_id_token raised %s: %s", type(e).__name__, e)
            return jsonify({"error": "Token verification failed"}), 401

        google_id = decoded.get("uid")
        email = decoded.get("email") or data.get("email")
        name = decoded.get("name") or data.get("name")
        profile_picture = decoded.get("picture") or data.get("profile_picture")

        if not google_id:
            return jsonify({"error": "Token missing uid"}), 400

        last_logged_in = datetime.utcnow().isoformat()

        response = supabase.from_("users").select("*").eq("google_id", google_id).execute()
        existing_user = response.data

        if existing_user:
            supabase.from_("users").update({"last_logged_in": last_logged_in}).eq("google_id", google_id).execute()
            user = existing_user[0]
        else:
            new_user = {
                "google_id": google_id,
                "email": email,
                "name": name,
                "profile_picture": profile_picture,
                "last_logged_in": last_logged_in,
            }
            response = supabase.from_("users").insert(new_user).execute()
            user = response.data[0]

        access_token = create_access_token(identity=google_id)
        return jsonify({"message": "User logged in", "user": user, "access_token": access_token}), 200

    except Exception as e:
        return _server_error("login failed", e)


# =============================== HABITS ===================================


@api.route("/api/add/habit", methods=["POST"])
@jwt_required()
def add_habit():
    try:
        google_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        if not data.get("title"):
            return jsonify({"error": "Title is required"}), 400

        reminder_time = data.get("reminder_time")
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
            "progress": 0,
        }

        supabase.from_("habits").insert(new_habit).execute()
        return jsonify({"message": "Habit added successfully"}), 201
    except Exception as e:
        return _server_error("add_habit failed", e)


@api.route("/api/get/habits", methods=["GET"])
@jwt_required()
def get_habits():
    try:
        google_id = get_jwt_identity()
        response = supabase.from_("habits").select("*").eq("google_id", google_id).execute()
        habits = response.data

        today = datetime.utcnow().strftime("%A")
        filtered_habits = []
        for habit in habits:
            if habit["frequency"] == "daily":
                filtered_habits.append(habit)
            elif habit["frequency"] == "weekly" and today in habit["days_of_week"]:
                filtered_habits.append(habit)

        return jsonify(filtered_habits)
    except Exception as e:
        return _server_error("get_habits failed", e)


@api.route("/api/delete/habit/<id>", methods=["DELETE"])
@jwt_required()
def delete_habit(id):
    try:
        google_id = get_jwt_identity()
        response = supabase.from_("habits").select("id").eq("id", id).eq("google_id", google_id).execute()

        if not response.data:
            return jsonify({"error": "Habit not found"}), 404

        supabase.from_("habits").delete().eq("id", id).eq("google_id", google_id).execute()
        return jsonify({"message": "Habit deleted successfully"}), 200
    except Exception as e:
        return _server_error("delete_habit failed", e)


# =================  JOURNAL ROUTES ==========================================


@api.route("/api/get/journals", methods=["GET"])
@jwt_required()
def get_users_journals():
    try:
        google_id = get_jwt_identity()
        response = (
            supabase.from_("journals")
            .select("*")
            .eq("google_id", google_id)
            .order("created_at", desc=True)
            .execute()
        )
        journals = response.data or []

        for journal in journals:
            journal["content"] = decrypt_content(journal.get("content"))

        return jsonify({"journals": journals}), 200
    except Exception as e:
        return _server_error("get_users_journals failed", e)


@api.route("/api/add/journal", methods=["POST"])
@jwt_required()
def add_journal_entry():
    try:
        google_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        title = data.get("title")
        content = data.get("content")
        mood = data.get("mood", "neutral")
        tags = data.get("tags", [])
        attachments = data.get("attachments", [])
        privacy = data.get("privacy", "private")

        if not title or not content:
            return jsonify({"error": "Missing required fields"}), 400

        encrypted_content = encrypt_content(content)

        new_entry = {
            "google_id": google_id,
            "title": title,
            "content": encrypted_content,
            "mood": mood,
            "tags": tags,
            "attachments": attachments,
            "privacy": privacy,
            "created_at": datetime.utcnow().isoformat(),
            "last_edited_at": datetime.utcnow().isoformat(),
        }

        response = supabase.from_("journals").insert(new_entry).execute()

        if response.data:
            response.data[0]["content"] = decrypt_content(response.data[0].get("content"))

        return jsonify({"message": "Journal entry added successfully", "journal": response.data}), 201
    except Exception as e:
        return _server_error("add_journal_entry failed", e)


@api.route("/api/delete/journal/<id>", methods=["DELETE"])
@jwt_required()
def delete_entry(id):
    try:
        google_id = get_jwt_identity()

        response = (
            supabase.from_("journals")
            .select("id")
            .eq("id", id)
            .eq("google_id", google_id)
            .execute()
        )

        if not response.data:
            return jsonify({"error": "Journal entry not found"}), 404

        # Filter on both id AND google_id so we never delete another user's row
        # even if the ownership check above somehow returned the wrong record.
        supabase.from_("journals").delete().eq("id", id).eq("google_id", google_id).execute()

        return jsonify({"message": "Journal entry deleted successfully", "deleted_id": id}), 200
    except Exception as e:
        return _server_error("delete_entry failed", e)


@api.route("/api/get/journal/<id>", methods=["GET"])
@jwt_required()
def get_entry_by_id(id):
    try:
        google_id = get_jwt_identity()
        response = (
            supabase.from_("journals")
            .select("*")
            .eq("id", id)
            .eq("google_id", google_id)
            .execute()
        )
        journal_entry_list = response.data

        if not journal_entry_list:
            return jsonify({"error": "Journal entry not found"}), 404

        journal_entry = journal_entry_list[0]
        journal_entry["content"] = decrypt_content(journal_entry.get("content"))

        return jsonify({"journal": journal_entry}), 200
    except Exception as e:
        return _server_error("get_entry_by_id failed", e)


# ================================ TASKS ROUTES =================================


@api.route("/api/get/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        google_id = get_jwt_identity()
        response = supabase.from_("tasks").select("*").eq("google_id", google_id).execute()
        tasks = response.data
        return jsonify({"tasks": tasks}), 200
    except Exception as e:
        return _server_error("get_tasks failed", e)


@api.route("/api/add/task", methods=["POST"])
@jwt_required()
def add_task():
    try:
        google_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        if not data.get("title"):
            return jsonify({"error": "Title is required"}), 400

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
        return _server_error("add_task failed", e)


@api.route("/api/delete/task/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    try:
        google_id = get_jwt_identity()

        response = (
            supabase.from_("tasks")
            .select("id")
            .eq("id", task_id)
            .eq("google_id", google_id)
            .execute()
        )

        if not response.data:
            return jsonify({"error": "Task not found"}), 404

        supabase.from_("tasks").delete().eq("id", task_id).eq("google_id", google_id).execute()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return _server_error("delete_task failed", e)


@api.route("/api/toggle/task/<task_id>", methods=["PATCH"])
@jwt_required()
def complete_task(task_id):
    try:
        google_id = get_jwt_identity()

        response = (
            supabase.from_("tasks")
            .select("completed")
            .eq("id", task_id)
            .eq("google_id", google_id)
            .execute()
        )
        task = response.data

        if not task:
            return jsonify({"error": "Task not found"}), 404

        new_value = not bool(task[0]["completed"])
        supabase.from_("tasks").update({"completed": new_value}).eq("id", task_id).eq("google_id", google_id).execute()

        return jsonify({"message": "Task toggled", "completed": new_value}), 200
    except Exception as e:
        return _server_error("complete_task failed", e)


# ================================ LAUNCHPAD ROUTES =================================


@api.route("/api/launchpad", methods=["GET"])
@jwt_required()
def get_launchpad_month():
    try:
        google_id = get_jwt_identity()
        month = request.args.get("month")
        month_start, month_end, error = parse_launchpad_month(month)

        if error:
            return jsonify({"error": error}), 400

        trackers_response = (
            supabase.from_("launchpad_trackers")
            .select("*")
            .eq("google_id", google_id)
            .eq("archived", False)
            .order("display_order")
            .order("created_at")
            .execute()
        )
        trackers = trackers_response.data or []

        entries_response = (
            supabase.from_("launchpad_entries")
            .select("*")
            .eq("google_id", google_id)
            .gte("entry_date", month_start)
            .lte("entry_date", month_end)
            .order("entry_date")
            .execute()
        )
        entries = entries_response.data or []

        return (
            jsonify(
                {
                    "month": month_start[:7],
                    "trackers": trackers,
                    "entries": entries,
                }
            ),
            200,
        )
    except Exception as e:
        return _server_error("get_launchpad_month failed", e)


@api.route("/api/launchpad/day", methods=["POST"])
@jwt_required()
def upsert_launchpad_day():
    try:
        google_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        entry_date = data.get("entry_date")
        memorable_moment = (data.get("memorable_moment") or "").strip()
        tracker_values = data.get("tracker_values", {})

        if not entry_date:
            return jsonify({"error": "entry_date is required"}), 400

        try:
            normalized_date = datetime.strptime(entry_date, "%Y-%m-%d").date().isoformat()
        except ValueError:
            return jsonify({"error": "entry_date must be in YYYY-MM-DD format"}), 400

        if not isinstance(tracker_values, dict):
            return jsonify({"error": "tracker_values must be an object"}), 400

        existing_entry = (
            supabase.from_("launchpad_entries")
            .select("id")
            .eq("google_id", google_id)
            .eq("entry_date", normalized_date)
            .execute()
        )

        payload = {
            "google_id": google_id,
            "entry_date": normalized_date,
            "memorable_moment": memorable_moment,
            "remember_this": "",
            "tracker_values": tracker_values,
            "updated_at": datetime.utcnow().isoformat(),
        }

        if existing_entry.data:
            response = (
                supabase.from_("launchpad_entries")
                .update(payload)
                .eq("id", existing_entry.data[0]["id"])
                .eq("google_id", google_id)
                .execute()
            )
            entry = response.data[0] if response.data else payload
            return jsonify({"message": "Launchpad day updated", "entry": entry}), 200

        payload["created_at"] = datetime.utcnow().isoformat()
        response = supabase.from_("launchpad_entries").insert(payload).execute()
        entry = response.data[0] if response.data else payload
        return jsonify({"message": "Launchpad day created", "entry": entry}), 201
    except Exception as e:
        return _server_error("upsert_launchpad_day failed", e)


@api.route("/api/launchpad/trackers", methods=["POST"])
@jwt_required()
def create_launchpad_tracker():
    try:
        google_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        label = (data.get("label") or "").strip()
        tracker_type = normalize_tracker_type(data.get("tracker_type"))
        unit = (data.get("unit") or "").strip() or None
        display_order = data.get("display_order", 0)
        config = data.get("config", {})

        if not label:
            return jsonify({"error": "label is required"}), 400

        if not tracker_type:
            return jsonify({"error": "tracker_type must be checkbox, number, or rating"}), 400

        if not isinstance(config, dict):
            return jsonify({"error": "config must be an object"}), 400

        try:
            display_order = int(display_order)
        except (TypeError, ValueError):
            display_order = 0

        tracker_payload = {
            "google_id": google_id,
            "label": label,
            "tracker_type": tracker_type,
            "unit": unit,
            "display_order": display_order,
            "config": config,
            "archived": False,
            "created_at": datetime.utcnow().isoformat(),
        }

        response = supabase.from_("launchpad_trackers").insert(tracker_payload).execute()
        tracker = response.data[0] if response.data else tracker_payload
        return jsonify({"message": "Tracker created", "tracker": tracker}), 201
    except Exception as e:
        return _server_error("create_launchpad_tracker failed", e)


@api.route("/api/launchpad/tracker/<tracker_id>", methods=["PATCH"])
@jwt_required()
def update_launchpad_tracker(tracker_id):
    try:
        google_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}

        existing_tracker = (
            supabase.from_("launchpad_trackers")
            .select("id")
            .eq("id", tracker_id)
            .eq("google_id", google_id)
            .execute()
        )

        if not existing_tracker.data:
            return jsonify({"error": "Tracker not found"}), 404

        update_payload = {}

        if "label" in data:
            label = (data.get("label") or "").strip()
            if not label:
                return jsonify({"error": "label cannot be empty"}), 400
            update_payload["label"] = label

        if "tracker_type" in data:
            tracker_type = normalize_tracker_type(data.get("tracker_type"))
            if not tracker_type:
                return jsonify({"error": "tracker_type must be checkbox, number, or rating"}), 400
            update_payload["tracker_type"] = tracker_type

        if "unit" in data:
            update_payload["unit"] = (data.get("unit") or "").strip() or None

        if "display_order" in data:
            try:
                update_payload["display_order"] = int(data.get("display_order"))
            except (TypeError, ValueError):
                return jsonify({"error": "display_order must be a number"}), 400

        if "config" in data:
            if not isinstance(data.get("config"), dict):
                return jsonify({"error": "config must be an object"}), 400
            update_payload["config"] = data.get("config")

        if "archived" in data:
            update_payload["archived"] = bool(data.get("archived"))

        if not update_payload:
            return jsonify({"error": "No valid fields provided"}), 400

        response = (
            supabase.from_("launchpad_trackers")
            .update(update_payload)
            .eq("id", tracker_id)
            .eq("google_id", google_id)
            .execute()
        )
        tracker = response.data[0] if response.data else None
        return jsonify({"message": "Tracker updated", "tracker": tracker}), 200
    except Exception as e:
        return _server_error("update_launchpad_tracker failed", e)


@api.route("/api/launchpad/tracker/<tracker_id>", methods=["DELETE"])
@jwt_required()
def archive_launchpad_tracker(tracker_id):
    try:
        google_id = get_jwt_identity()

        existing_tracker = (
            supabase.from_("launchpad_trackers")
            .select("id")
            .eq("id", tracker_id)
            .eq("google_id", google_id)
            .execute()
        )

        if not existing_tracker.data:
            return jsonify({"error": "Tracker not found"}), 404

        response = (
            supabase.from_("launchpad_trackers")
            .update({"archived": True})
            .eq("id", tracker_id)
            .eq("google_id", google_id)
            .execute()
        )
        tracker = response.data[0] if response.data else None
        return jsonify({"message": "Tracker archived", "tracker": tracker}), 200
    except Exception as e:
        return _server_error("archive_launchpad_tracker failed", e)
