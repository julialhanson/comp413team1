#THIS FILE IS SUPPOSED TO TAKE IN AN IMAGE AND SIMULATE GAZE DATA ON IT
import cv2
import numpy as np
import matplotlib.pyplot as plt
import random
import os

def load_image(filepath):
    """Load an image and convert it to grayscale."""
    
    image = cv2.imread(filepath)
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

    visualize_points(image, contour, border_points, internal_points)
    visualize_heatmap(image, border_points, internal_points)
    plt.show()

# figure out params for 
simulate_derm_gaze('ml/lesion.jpg', num_border_points=150, num_internal_points=150)
