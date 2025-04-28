from google.cloud import storage
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt
import cv2
import numpy as np
import random

# if you haven't already made a GCP key, follow these instructions and rename the key file to 'gcp_cred.json'
# Go to GCP Console --> Service Accounts --> Keys --> Add Key --> Create New Key --> JSON

##################
#  GCP CONTROLS  #
##################

def upload_image(bucket_name:str, blob_name: str, path: str):
    client = storage.Client.from_service_account_json('gcp_cred.json')

    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_filename(path)

    #returns a public url
    return blob.public_url

# passes a buffer assumed to be an image
def upload_buf(bucket_name:str, blob_name: str, buf, file_type: str = "image/jpg"):
    client = storage.Client.from_service_account_json('gcp_cred.json')

    bucket = client.get_bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.upload_from_file(buf, content_type=file_type)

    #returns a public url
    return blob.public_url

def download_image(bucket_name: str, blob_name: str):
    client = storage.Client.from_service_account_json('gcp_cred.json')

    bucket = client.get_bucket(bucket_name)
    blob = bucket.get_blob(blob_name)
    img = Image.open(BytesIO(blob.download_as_bytes()))

    return img

########################
#  HEATMAP GENERATION  #
######################## 


def load_image(img: Image):
    """Load an image and convert it to grayscale."""

    img.convert("RGB")
    image = np.array(img)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image, gray

def segment_lesion(gray_image, threshold_value=100):
    """Segment the lesion by thresholding and finding the largest contour."""
    _, binary = cv2.threshold(gray_image, threshold_value, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise ValueError("No contours found!")
    largest_contour = max(contours, key=cv2.contourArea)
    return largest_contour

def sample_border_points(contour, num_points):
    """Sample random points along the contour (border)."""
    contour_points = contour.squeeze()
    if len(contour_points.shape) == 1:  # Handle rare case of a single point
        contour_points = np.expand_dims(contour_points, axis=0)
    sampled_points = []
    for _ in range(num_points):
        idx = random.randint(0, len(contour_points) - 1)
        sampled_points.append(tuple(contour_points[idx]))
    return sampled_points

def sample_internal_points(mask, num_points):
    """Sample random points inside the lesion mask."""
    ys, xs = np.where(mask == 255)
    sampled_points = []
    for _ in range(num_points):
        idx = random.randint(0, len(xs) - 1)
        sampled_points.append((xs[idx], ys[idx]))
    return sampled_points

def create_mask_from_contour(shape, contour):
    """Create a filled mask from the contour."""
    mask = np.zeros(shape, dtype=np.uint8)
    cv2.drawContours(mask, [contour], -1, 255, -1)
    return mask

def visualize_heatmap(image, border_points, internal_points, blob_name="test.jpg"):
    img_height, img_width, _ = image.shape

    # --- Create heatmap matrix ---
    heatmap = np.zeros((img_height, img_width))  # Note: image size is (width, height), but numpy is (rows, cols)

    # Draw each gaze point into heatmap
    for x, y in border_points + internal_points:
        if 0 <= x < img_width and 0 <= y < img_height:
            heatmap[y, x] += 1  # y is row, x is column

    # --- Blur heatmap using Gaussian filter ---
    from scipy.ndimage import gaussian_filter
    heatmap_blurred = gaussian_filter(heatmap, sigma=30)

    # --- Normalize to [0, 1] ---
    heatmap_normalized = heatmap_blurred / np.max(heatmap_blurred)

    # --- Plot the image and overlay the heatmap ---
    plt.figure(figsize=(10, 8))
    plt.imshow(image)  # Background image
    plt.imshow(heatmap_normalized, cmap='jet', alpha=0.4)  # Heatmap overlay
    plt.axis('off')
    plt.title('Gaze Heatmap Overlay')
    plt.tight_layout()
    # plt.show()

    # Save the overlay
    buf = BytesIO()
    plt.savefig(buf, format='jpg')
    buf.seek(0)
    plt.close()

    return upload_buf("eye-sense-heatmap-data", blob_name, buf)
    

def simulate_derm_gaze(blobpath, num_border_points=20, num_internal_points=10):
    img = download_image('eye-sense-image-data', blobpath)

    image, gray = load_image(img)
    contour = segment_lesion(gray)
    mask = create_mask_from_contour(gray.shape, contour)

    border_points = sample_border_points(contour, num_border_points)
    internal_points = sample_internal_points(mask, num_internal_points)

    # visualize_points(image, contour, border_points, internal_points)
    visualize_heatmap(image, border_points, internal_points)
    plt.show()

# simulate_derm_gaze("ISIC-images/ISIC_0000003.jpg")

# use to iterate through bucket
def processImages(bucket_name: str, folder = ""):
    client = storage.Client.from_service_account_json('gcp_cred.json')

    bucket = client.get_bucket(bucket_name)
    blobs = bucket.list_blobs(max_results = 4, prefix = folder)
    
    for blob in blobs:
        for i in range(3): # used to do different levels of experience
            match i:
                case 0:
                    experience_level = "novice"
                    num_border_points = 100
                    num_internal_points = 200
                case 1:
                    experience_level = "med_student"
                    num_border_points = 150
                    num_internal_points = 150
                case _:
                    experience_level = "dermatologist"
                    num_border_points = 250
                    num_internal_points = 50
            
            
            img = Image.open(BytesIO(blob.download_as_bytes()))
            image, gray = load_image(img)
            contour = segment_lesion(gray)
            mask = create_mask_from_contour(gray.shape, contour)

            border_points = sample_border_points(contour, num_border_points)
            internal_points = sample_internal_points(mask, num_internal_points)
            print(visualize_heatmap(image, border_points, internal_points, blob.name[:-4] + "_"     + experience_level + ".jpg"))

processImages('eye-sense-image-data', folder = 'ISIC-images/')



# download_image("lesion.jpg")
# print(upload_image('eye-sense-image-data', "lesion.jpg", "ml/lesion.jpg"))
