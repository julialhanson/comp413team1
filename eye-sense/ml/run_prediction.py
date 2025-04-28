import os
import sys
import argparse
import tensorflow as tf
import cv2
import numpy as np
import matplotlib.pyplot as plt

def predict_on_image(image_path, model_path, output_path=None, image_size=(256, 256)):
    """Load a saved model and make a prediction on a new image."""
    # Make paths absolute
    image_path = os.path.abspath(image_path)
    model_path = os.path.abspath(model_path)
    
    print(f"Image path: {image_path}")
    print(f"Model path: {model_path}")
    
    # Check if image exists
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    # Check if model exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please train the model first.")
    
    print(f"Loading model from {model_path}")
    
    try:
        # Load the model
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded successfully")
        
        # Load and preprocess the image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image at {image_path}")
        
        print(f"Image loaded: {image_path} (shape: {image.shape})")
        
        # Resize image
        image_resized = cv2.resize(image, image_size)
        
        # Normalize the image
        image_normalized = image_resized / 255.0
        
        # Add batch dimension
        image_batch = np.expand_dims(image_normalized, axis=0)
        
        # Make prediction
        print("Generating prediction...")
        prediction = model.predict(image_batch)
        heatmap = prediction[0].squeeze()
        
        # Visualize and save the result
        plt.figure(figsize=(12, 6))
        
        # Original image
        plt.subplot(1, 2, 1)
        plt.imshow(cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB))
        plt.axis('off')
        plt.title('Original Image')
        
        # Predicted heatmap
        plt.subplot(1, 2, 2)
        plt.imshow(cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB))
        plt.imshow(heatmap, cmap='jet', alpha=0.4)
        plt.axis('off')
        plt.title('Predicted Heatmap')
        
        plt.tight_layout()
        
        # Create output directory if it doesn't exist
        if output_path is None:
            output_dir = os.path.dirname(model_path)
            output_path = os.path.join(output_dir, 'prediction_result.png')
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.savefig(output_path)
        print(f"Prediction saved to {output_path}")
        plt.close()
        
        return heatmap
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise

def main():
    parser = argparse.ArgumentParser(description="Make predictions with the heatmap model")
    parser.add_argument("--image", required=True, help="Path to the input image")
    parser.add_argument("--model", default="ml/models/gcp_heatmap_predictor", help="Path to the saved model")
    parser.add_argument("--output", help="Path to save the prediction visualization (optional)")
    args = parser.parse_args()
    
    # Resolve paths to be absolute
    image_path_abs = os.path.abspath(args.image)
    model_path_abs = os.path.abspath(args.model)
    output_path_abs = os.path.abspath(args.output) if args.output else None
    
    try:
        # Make a prediction on the image directly without using GCPHeatmapModel
        heatmap = predict_on_image(
            image_path=image_path_abs,
            model_path=model_path_abs,
            output_path=output_path_abs
        )
        print("Prediction completed successfully!")
    except Exception as e:
        print(f"Error making prediction: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 