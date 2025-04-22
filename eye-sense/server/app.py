from flask import Flask
from routes.heatmap import api_heatmap
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(api_heatmap, url_prefix="/api/v1/heatmaps")
CORS(app)


if __name__ == "__main__":
    app.run(host='localhost', debug=True)