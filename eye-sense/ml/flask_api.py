from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from PIL import Image
import io

from your_module import simulate_dermgaze  # Replace with actual path if needed

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    try:
        # Load the image
        image = Image.open(file).convert("RGB")

        # Run your heatmap generator
        heatmap = simulate_dermgaze(image)

        # Prepare image response
        img_io = io.BytesIO()
        heatmap.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(img_io, mimetype='image/png')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
