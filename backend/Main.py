# main.py, entry point.

from datetime import timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from api import api

import os

load_dotenv()


app = Flask(__name__)

CORS(app,
     resources={r"/*": {
         "origins": ["http://localhost:5173", "http://localhost:3000", "https://mindfulmomentum.vercel.app", "https://mindfulmomentum-frontend-drj7puuih-namans-projects-8a5a8d52.vercel.app", "https://mindfulmomentum-frontend.vercel.app"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }})

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

app.register_blueprint(api)


@app.route("/api/health", methods=["GET"])
def health():
    if request.args.get("ping_db"):
        from config import supabase
        supabase.from_("users").select("id").limit(1).execute()
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
