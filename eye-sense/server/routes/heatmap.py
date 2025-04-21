import sys
from flask import Blueprint, app, request, send_file, make_response, jsonify, Response
import json

api_heatmap = Blueprint("heatmap", __name__)

@api_heatmap.before_request
def basic_authentication():
    print("basic authenticating")
    headers = {'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type',
               'Access-Control-Allow-Credentials': 'true'}
    if request.method.lower() == 'options':
        print("method is OPTIONS")
        return jsonify(headers), 200

@api_heatmap.route("/", methods=["GET"])
def get_data():
    print("receiving GET request")
    return jsonify({"message": "received"})

@api_heatmap.route("/", methods=["POST"])
def generate_heatmap():
    """Generates heatmap for image given the gaze data, 
    width and height of the image, and the image in base 64.
    
    Inputs:
        gazeDataStr: JSON string of gaze data coordinates
        width: int representing width of image
        height: int representing height of image
        imageBase64: image to generate heatmap overlay for in base 64 string

    Returns:
        file: image with heatmap overlay
    """
    # app.logger.error("trying to generate heatmap", file=sys.stderr)
    try:
        import numpy as np
        from PIL import Image
        import matplotlib.pyplot as plt
        from scipy.ndimage import gaussian_filter
        from io import BytesIO
        import base64
        
        data = request.json
        image_base64 = data['imageBase64']
        display_width = data['width']
        display_height = data['height']
        gaze_data_str = data['gazeDataStr']
        
        # Load and resize background image
        img = Image.open(BytesIO(base64.b64decode(image_base64)))
        img = img.resize((display_width, display_height), Image.BILINEAR)
        img_width, img_height = img.size

        # Load and filter gaze data
        gaze_data = json.loads(gaze_data_str)
        points = [(int(d['x']), int(d['y'])) for d in gaze_data if 0 <= d['x'] < img_width and 0 <= d['y'] < img_height]

        # Create heatmap
        heatmap = np.zeros((img_height, img_width))
        for x, y in points:
            heatmap[y, x] += 1

        heatmap_blurred = gaussian_filter(heatmap, sigma=30)
        heatmap_normalized = heatmap_blurred / np.max(heatmap_blurred) if np.max(heatmap_blurred) != 0 else heatmap_blurred

        # Plot image + heatmap as full-size with black outside
        plt.figure(figsize=(img_width / 100, img_height / 100), dpi=100)
        plt.imshow(img)
        plt.imshow(heatmap_normalized, cmap='jet', alpha=0.4)
        plt.axis('off')

        buf = BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0, facecolor='black')
        plt.close()
        buf.seek(0)
        "data:image/png;base64," + base64.b64encode(buf.read()).decode('utf-8')

        response = make_response(send_file(buf, mimetype='image/png'))
        response.headers["Content-Disposition"] = "inline; filename=heatmap.png"
        return response

    except Exception as e:
        # Only return an error if send_file() hasn't started streaming
        print("Error during image processing:", e)
        return {"error": str(e)}, 500