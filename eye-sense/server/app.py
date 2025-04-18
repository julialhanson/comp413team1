from flask import Flask, request, jsonify
from routes.heatmap import api_heatmap
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.register_blueprint(api_heatmap, url_prefix="/api/v1/heatmaps")

if __name__ == "__main__":
    app.run(debug=True)