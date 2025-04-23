import cv2
import numpy as np
import matplotlib.pyplot as plt
import random
import os
import datetime

def zoom_image(image, zoom_factor=1.2):
    """Zoom into the center of the image by a zoom_factor."""
    h, w = image.shape[:2]
    new_h = int(h / zoom_factor)
    new_w = int(w / zoom_factor)
    top = (h - new_h) // 2
    left = (w - new_w) // 2
    cropped = image[top:top+new_h, left:left+new_w]
    return cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)

def remove_hair(image, kernel_size=17, threshold=10, inpaint_radius=1):
    """Removes hair using black-hat filtering + inpainting."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
    blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
    _, mask = cv2.threshold(blackhat, threshold, 255, cv2.THRESH_BINARY)
    inpainted = cv2.inpaint(image, mask, inpaint_radius, cv2.INPAINT_TELEA)
    return inpainted

def load_image(filepath):
    """Load and return BGR and grayscale image."""
    image = cv2.imread(filepath)
    return image, cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def segment_lesion(gray_image):
    """Segment the lesion using Otsu thresholding and return the largest contour."""
    _, binary = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise ValueError("No contours found!")
    return max(contours, key=cv2.contourArea)

def sample_border_points(contour, num_points):
    contour_points = contour.squeeze()
    if len(contour_points.shape) == 1:
        contour_points = np.expand_dims(contour_points, axis=0)
    indices = np.random.choice(len(contour_points), num_points, replace=True)
    return [tuple(contour_points[i]) for i in indices]

def sample_internal_points(mask, num_points):
    ys, xs = np.where(mask == 255)
    if len(xs) == 0:
        return []
    indices = np.random.choice(len(xs), num_points, replace=True)
    return list(zip(xs[indices], ys[indices]))

def create_mask_from_contour(shape, contour):
    mask = np.zeros(shape, dtype=np.uint8)
    cv2.drawContours(mask, [contour], -1, 255, -1)
    return mask

def visualize_heatmap(image, border_points, internal_points, output_dir='dataset/heatmaps', visualize=False, sigma=30, original_filename=None):
    h, w, _ = image.shape
    heatmap = np.zeros((h, w), dtype=np.float32)

    for x, y in border_points + internal_points:
        if 0 <= x < w and 0 <= y < h:
            heatmap[y, x] += 1

    from scipy.ndimage import gaussian_filter

    
    heatmap_blurred = gaussian_filter(heatmap, sigma=30)
    heatmap_blurred = np.power(heatmap_blurred, 0.7)

    if np.max(heatmap_blurred) == 0:
        return

    heatmap_normalized = heatmap_blurred / np.max(heatmap_blurred)

    plt.figure(figsize=(10, 8))
    plt.imshow(image)
    plt.imshow(heatmap_normalized, cmap='jet', alpha=0.4)
    plt.axis('off')
    plt.title('Gaze Heatmap Overlay')

    if visualize: 
        plt.show()
        return

    os.makedirs(output_dir, exist_ok=True)
    
    if original_filename:
        base_name = os.path.splitext(original_filename)[0]
        filename = f'{output_dir}/{base_name}_heatmap.png'
    else:
        filename = f'{output_dir}/heatmap_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")}.jpg'
    
    plt.savefig(filename, bbox_inches='tight', pad_inches=0)
    plt.close()
