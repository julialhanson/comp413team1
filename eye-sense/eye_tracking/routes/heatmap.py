from flask import Blueprint, request, jsonify

api_heatmap = Blueprint("heatmap", __name__)

@api_heatmap.route("/data", methods=["GET"])
def handle_data():
    data = request.json
    return jsonify({"received": "data"})
