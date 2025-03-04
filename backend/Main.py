from flask import Flask, jsonify
from flask_cors import CORS
from config import supabase
from users import users


app = Flask(__name__)
CORS(app)

app.register_blueprint(users)

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
