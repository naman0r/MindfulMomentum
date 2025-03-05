from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from config import supabase
from api import api
from flask_jwt_extended import JWTManager



app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "hfwkhsdfpkdfpwouw1eo23`02399vdhkhkllhkdavclk"  # CHANGE THIS TO A RANDOM STRING

jwt = JWTManager(app)

users = {"naman": {"password": "password123"}}


SESSION_DURATION = 60*  60 * 24 * 7 # 7 days in seconds

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
