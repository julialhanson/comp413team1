#THIS FILE IS SUPPOSED TO TAKE IN AN IMAGE AND SIMULATE GAZE DATA ON IT
import cv2
import numpy as np
import matplotlib.pyplot as plt
import random
import os

def load_image(filepath):
    """Load an image and convert it to grayscale."""
    image = cv2.imread(filepath)
    if image is None:
        raise ValueError(f"Could not load image at {filepath}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image, gray

def preprocess_image(gray):
    """Preprocess the image to enhance lesion visibility."""
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Apply bilateral filter to reduce noise while preserving edges
    filtered = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    return filtered

def segment_lesion(gray, min_contour_area=1000):
    """Segment the lesion using adaptive thresholding and contour detection."""
    # Preprocess the image
    processed = preprocess_image(gray)
    
    # Try different thresholding methods
    methods = [
        lambda img: cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY_INV, 11, 2),
        lambda img: cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                        cv2.THRESH_BINARY_INV, 11, 2),
        lambda img: cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    ]
    
    for method in methods:
        try:
            binary = method(processed)
            
            # Find contours
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Filter contours by area
                valid_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_contour_area]
                
                if valid_contours:
                    # Return the largest valid contour
                    return max(valid_contours, key=cv2.contourArea)
        except:
            continue
    
    # If all methods fail, try a simple threshold
    try:
        _, binary = cv2.threshold(processed, 127, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            return max(contours, key=cv2.contourArea)
    except:
        pass
    
    # If still no contour found, create a default contour (center of image)
    height, width = gray.shape
    center_x, center_y = width // 2, height // 2
    radius = min(width, height) // 4
    return np.array([[[center_x + radius * np.cos(theta), 
                      center_y + radius * np.sin(theta)]] 
                    for theta in np.linspace(0, 2*np.pi, 100)], dtype=np.int32)

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

def visualize_points(image, contour, border_points, internal_points):
    """Visualize the contour and sampled points on the image."""
    vis_image = image.copy()
    cv2.drawContours(vis_image, [contour], -1, (0, 255, 0), 2)  # Green contour
    
    for p in border_points:
        cv2.circle(vis_image, p, 5, (255, 0, 0), -1)  # Blue border points

    for p in internal_points:
        cv2.circle(vis_image, p, 5, (0, 0, 255), -1)  # Red internal points

    plt.figure(figsize=(8, 8))
    plt.imshow(cv2.cvtColor(vis_image, cv2.COLOR_BGR2RGB))
    plt.title('Simulated Doctor Gaze Points')
    plt.axis('off')
    # plt.show()

def visualize_heatmap(image, border_points, internal_points):
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
    plt.tight_layout()
    # plt.show()

    # --- Optional: Save the overlay ---
    # plt.savefig('heatmap_overlay.jpg', bbox_inches='tight', pad_inches=0)
    # plt.close()

def simulate_derm_gaze(filepath, num_border_points=20, num_internal_points=10):
    image, gray = load_image(filepath)
    contour = segment_lesion(gray)
    mask = create_mask_from_contour(gray.shape, contour)

    border_points = sample_border_points(contour, num_border_points)
    internal_points = sample_internal_points(mask, num_internal_points)

    # visualize_points(image, contour, border_points, internal_points)
    visualize_heatmap(image, border_points, internal_points)
    plt.show()


