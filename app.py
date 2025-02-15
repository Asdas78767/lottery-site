from flask import Flask, request, jsonify
import random
import json
import os

app = Flask(__name__)

DATA_FILE = "lottery_data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"participants": [], "lottery_images": None}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def generate_lottery_images():
    return random.sample(range(1, 28), 4)

def check_winning(user_images, lottery_images):
    return len(set(user_images) & set(lottery_images))

@app.route('/lottery', methods=['POST'])
def lottery():
    data = load_data()
    request_data = request.json
    mc_id = request_data.get("mc_id", "").strip()
    user_images = list(map(int, request_data.get("images", [])))

    if not mc_id:
        return jsonify({"error": "마인크래프트 아이디를 입력하세요!"}), 400
    if len(user_images) != 4:
        return jsonify({"error": "4개의 이미지를 선택하세요"}), 400

    data["participants"].append({"mc_id": mc_id, "images": user_images})
    save_data(data)

    return jsonify({
        "participants": len(data["participants"])
    })

@app.route('/admin/draw', methods=['POST'])
def admin_draw():
    data = load_data()
    lottery_images = generate_lottery_images()
    data["lottery_images"] = lottery_images

    winners = [p["mc_id"] for p in data["participants"] if check_winning(p["images"], lottery_images) >= 2]

    save_data(data)

    return jsonify({
        "lottery_images": lottery_images,
        "winners": winners
    })

@app.route('/status', methods=['GET'])
def status():
    data = load_data()
    return jsonify({
        "participants": len(data["participants"]),
        "total_money": len(data["participants"]) * 50000
    })

if __name__ == "__main__":
    app.run(debug=True)
