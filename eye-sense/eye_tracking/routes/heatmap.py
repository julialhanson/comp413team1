from flask import Blueprint, request, send_file, make_response, jsonify
import json

api_heatmap = Blueprint("heatmap", __name__)


@api_heatmap.route("/", methods=["GET"])
def get_data():
    return jsonify({"message": "received"})

@api_heatmap.route("/", methods=["POST"])
def generate_heatmap():
    image_url = request.files["image"].filename
    
    import numpy as np
    from PIL import Image
    import matplotlib.pyplot as plt
    from io import BytesIO
    
    # --- Load the background image ---
    img = Image.open(image_url)
    img_width, img_height = img.size

    # --- Load gaze data from JSON ---
    with open('gaze-data.json') as f:
        gaze_data = json.load(f)

    # --- Filter valid gaze points ---
    points = [(int(d['x']), int(d['y'])) for d in gaze_data if 0 <= d['x'] < img_width and 0 <= d['y'] < img_height]

    # --- Create heatmap matrix ---
    heatmap = np.zeros((img_height, img_width))  # Note: image size is (width, height), but numpy is (rows, cols)

    # Draw each gaze point into heatmap
    for x, y in points:
        if 0 <= x < img_width and 0 <= y < img_height:
            heatmap[y, x] += 1  # y is row, x is column

    # --- Blur heatmap using Gaussian filter ---
    from scipy.ndimage import gaussian_filter
    heatmap_blurred = gaussian_filter(heatmap, sigma=30)

    # --- Normalize to [0, 1] ---
    heatmap_normalized = heatmap_blurred / np.max(heatmap_blurred)

    # --- Plot the image and overlay the heatmap ---
    plt.figure(figsize=(10, 8))
    plt.imshow(img)  # Background image
    plt.imshow(heatmap_normalized, cmap='jet', alpha=0.4)  # Heatmap overlay
    plt.axis('off')
    # plt.title('Gaze Heatmap Overlay')
    plt.tight_layout()
    # plt.show()

    # --- Optional: Save the overlay ---
    # plt.savefig('heatmap_overlay.jpg', bbox_inches='tight', pad_inches=0)
    # plt.close()
    
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)

    response = make_response(send_file(buf, mimetype='image/png'))
    response.headers["Content-Disposition"] = "inline; filename=heatmap.png"
    return response
