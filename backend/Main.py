# main.py, entry point. 

from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from config import supabase
from api import api
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from flask_talisman import Talisman #to make sevrer more secure, add https


import os

load_dotenv()



app = Flask(__name__)

# Allow CORS for all domains on all routes
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")  # Load JWT Secret Key from .env
# app.config["PREFERRED_URL_SCHEME"] = "https" # ???? does this actualy work


# Talisman(app)

jwt = JWTManager(app)






app.register_blueprint(api)


@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"message": "Flask is working!"})


@app.route("/api/test-supabase", methods=["GET"])
def test_supabase():
    try:
        response = supabase.from_("users").select("*").limit(1).execute()
        return jsonify({"message": "Supabase is connected!", "data": response.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500





if __name__ == "__main__":
    app.run(port=8000, debug=True)
