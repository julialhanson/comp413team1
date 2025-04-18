from flask import Blueprint, request, send_file, make_response, jsonify
import json

api_heatmap = Blueprint("heatmap", __name__)


@api_heatmap.route("/", methods=["GET"])
def get_data():
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
    import json
    import numpy as np
    from PIL import Image
    import matplotlib.pyplot as plt
    from scipy.ndimage import gaussian_filter
    from io import BytesIO
    import base64
    
    data = request.json
    image_base64 = data.imageBase64
    display_width = data.width
    display_height = data.height
    gaze_data_str = data.gazeDataStr

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
    
    
    # image_url = request.files["image"].filename
    
    # import numpy as np
    # from PIL import Image
    # import matplotlib.pyplot as plt
    # from io import BytesIO
    
    # # --- Load the background image ---
    # img = Image.open(image_url)
    # img_width, img_height = img.size

    # # --- Load gaze data from JSON ---
    # with open('gaze-data.json') as f:
    #     gaze_data = json.load(f)

    # # --- Filter valid gaze points ---
    # points = [(int(d['x']), int(d['y'])) for d in gaze_data if 0 <= d['x'] < img_width and 0 <= d['y'] < img_height]

    # # --- Create heatmap matrix ---
    # heatmap = np.zeros((img_height, img_width))  # Note: image size is (width, height), but numpy is (rows, cols)

    # # Draw each gaze point into heatmap
    # for x, y in points:
    #     if 0 <= x < img_width and 0 <= y < img_height:
    #         heatmap[y, x] += 1  # y is row, x is column

    # # --- Blur heatmap using Gaussian filter ---
    # from scipy.ndimage import gaussian_filter
    # heatmap_blurred = gaussian_filter(heatmap, sigma=30)

    # # --- Normalize to [0, 1] ---
    # heatmap_normalized = heatmap_blurred / np.max(heatmap_blurred)

    # # --- Plot the image and overlay the heatmap ---
    # plt.figure(figsize=(10, 8))
    # plt.imshow(img)  # Background image
    # plt.imshow(heatmap_normalized, cmap='jet', alpha=0.4)  # Heatmap overlay
    # plt.axis('off')
    # # plt.title('Gaze Heatmap Overlay')
    # plt.tight_layout()
    # # plt.show()

    # # --- Optional: Save the overlay ---
    # # plt.savefig('heatmap_overlay.jpg', bbox_inches='tight', pad_inches=0)
    # # plt.close()
    
    # buf = BytesIO()
    # plt.savefig(buf, format='png')
    # buf.seek(0)

    response = make_response(send_file(buf, mimetype='image/png'))
    response.headers["Content-Disposition"] = "inline; filename=heatmap.png"
    return response