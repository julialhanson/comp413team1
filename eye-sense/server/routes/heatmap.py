import os
from PIL import Image
from google.cloud import storage
from dotenv import load_dotenv
from flask import Blueprint, app, request, send_file, make_response, jsonify, Response
import json
from .et_bot_utils import *

load_dotenv(dotenv_path=r'./config.env')
GOOGLE_APPLICATION_CREDENTIALS = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'not found')
BUCKET_NAME = os.getenv('BUCKET_NAME', 'bucket not found')

api_heatmap = Blueprint("heatmap", __name__)

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
        filename: string representing exact name of blob in GCP bucket

    Returns:
        file: image with heatmap overlay
    """
    try:
        import numpy as np
        import matplotlib as mpl
        mpl.use('agg')
        import matplotlib.pyplot as plt
        from scipy.ndimage import gaussian_filter
        from io import BytesIO
        
        data = request.json
        filename = data['filename']
        display_width = data['width']
        display_height = data['height']
        gaze_data_str = data['gazeDataStr']
        
        if not filename:
            return {"error": "Missing filename"}, 400
        
        # Load and resize background image
        client = storage.Client.from_service_account_json(GOOGLE_APPLICATION_CREDENTIALS)
        
        bucket = client.get_bucket(BUCKET_NAME)
        blob = bucket.get_blob(filename)
                
        if blob is None:
            return {"error": f"File '{filename}' not found in bucket"}, 404
        
        image_bytes = blob.download_as_bytes()
        if not image_bytes:
            return {"error": f"Failed to download file '{filename}' from bucket"}, 500

        try:
            img = Image.open(BytesIO(image_bytes))
        except Exception as e:
            return {"error": f"Could not open image: {str(e)}"}, 500

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

        response = send_file(buf, mimetype='image/png')
        response.headers["Content-Disposition"] = "inline; filename=heatmap.png"
        return response

    except Exception as e:
        # Only return an error if send_file() hasn't started streaming
        print("Error during image processing:", e)


@api_heatmap.route("/bot/", methods=["POST"])
def simulate_dermgaze():
    """Predicts a heatmap for a skin lesion image, 
    width and height of the image, and the image in base 64.
    """
    # --- Get uploaded file
    if 'image' not in request.files:
        return {"error": "No image file provided"}, 400

    file = request.files['image']

    if file.filename == '':
        return {"error": "Empty filename"}, 400
    
    try:
        raw_image = Image.open(file.stream)
        np_image = np.array(raw_image)

        # data = request.json
        # filepath = data['filepath']
        num_border_points = 3000#data['num_border_points']
        num_internal_points = 2000#data['num_internal_points']
        
        # Load and zoom
        # raw_image, _ = load_image(filepath)
        image = zoom_image(np_image)
        
        # Hair removal
        cleaned = remove_hair(image)

        # Grayscale after cleanup
        gray = cv2.cvtColor(cleaned, cv2.COLOR_BGR2GRAY)

        # Segmentation
        contour = segment_lesion(gray)
        mask = create_mask_from_contour(gray.shape, contour)

        # Sampling
        border_points = sample_border_points(contour, num_border_points)
        internal_points = sample_internal_points(mask, num_internal_points)

        # Heatmap
        buf = visualize_heatmap(image, border_points, internal_points)#, original_filename=os.path.basename(filepath))
        response = send_file(buf, mimetype='image/png')
        response.headers["Content-Disposition"] = "inline; filename=bot-heatmap.png"
        return response
    
    except Exception as e:
        return {"error": str(e)}, 500
