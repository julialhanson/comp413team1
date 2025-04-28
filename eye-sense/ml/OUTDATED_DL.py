import os
import cv2
import numpy as np
from et_bot import simulate_derm_gaze, load_image, segment_lesion, create_mask_from_contour, sample_border_points, sample_internal_points
from google.cloud import aiplatform
import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.model_selection import train_test_split
from concurrent.futures import ProcessPoolExecutor, as_completed
from functools import partial
import multiprocessing
from tqdm import tqdm
import tempfile
import shutil

class HeatmapDatasetGenerator:
    def __init__(self, input_dir, output_dir, num_samples_per_image=5):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.num_samples_per_image = num_samples_per_image
        self.ensure_directories()
        self.num_workers = multiprocessing.cpu_count()
        self.temp_dir = tempfile.mkdtemp()
        
    def ensure_directories(self):
        """Create necessary directories if they don't exist."""
        os.makedirs(os.path.join(self.output_dir, 'images'), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, 'heatmaps'), exist_ok=True)
        
    def __del__(self):
        """Clean up temporary directory."""
        if hasattr(self, 'temp_dir'):
            shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def preprocess_image(self, image_path):
        """Preprocess image and cache results."""
        try:
            image, gray = load_image(image_path)
            contour = segment_lesion(gray)
            mask = create_mask_from_contour(gray.shape, contour)
            
            # Cache the results
            cache_path = os.path.join(self.temp_dir, f"{Path(image_path).stem}_cache.npz")
            np.savez(cache_path, image=image, gray=gray, contour=contour, mask=mask)
            
            return image, gray, contour, mask, cache_path
        except Exception as e:
            print(f"Warning: Failed to process {image_path}: {str(e)}")
            # Create a default mask covering the center of the image
            height, width = gray.shape
            center_x, center_y = width // 2, height // 2
            radius = min(width, height) // 4
            y, x = np.ogrid[-center_y:height-center_y, -center_x:width-center_x]
            mask = (x*x + y*y <= radius*radius).astype(np.uint8) * 255
            contour = np.array([[[center_x + radius * np.cos(theta), 
                                center_y + radius * np.sin(theta)]] 
                              for theta in np.linspace(0, 2*np.pi, 100)], dtype=np.int32)
            
            # Cache the results with default values
            cache_path = os.path.join(self.temp_dir, f"{Path(image_path).stem}_cache.npz")
            np.savez(cache_path, image=image, gray=gray, contour=contour, mask=mask)
            
            return image, gray, contour, mask, cache_path
    
    def load_cached_results(self, cache_path):
        """Load cached preprocessing results."""
        cache = np.load(cache_path)
        return cache['image'], cache['gray'], cache['contour'], cache['mask']
    
    def generate_heatmap_vectorized(self, image, contour, mask, num_border_points=150, num_internal_points=150):
        """Generate a heatmap using vectorized operations."""
        # Vectorized point sampling
        contour_points = contour.squeeze()
        if len(contour_points.shape) == 1:
            contour_points = np.expand_dims(contour_points, axis=0)
            
        # Sample border points
        border_indices = np.random.choice(len(contour_points), num_border_points, replace=True)
        border_points = contour_points[border_indices]
        
        # Sample internal points
        ys, xs = np.where(mask == 255)
        internal_indices = np.random.choice(len(xs), num_internal_points, replace=True)
        internal_points = np.column_stack((xs[internal_indices], ys[internal_indices]))
        
        # Create heatmap using vectorized operations
        heatmap = np.zeros(image.shape[:2], dtype=np.float32)
        all_points = np.vstack((border_points, internal_points))
        
        # Convert points to integer coordinates
        all_points = all_points.astype(int)
        
        # Filter out points outside image bounds
        valid_mask = (all_points[:, 0] >= 0) & (all_points[:, 0] < image.shape[1]) & \
                    (all_points[:, 1] >= 0) & (all_points[:, 1] < image.shape[0])
        valid_points = all_points[valid_mask]
        
        # Update heatmap using vectorized indexing
        heatmap[valid_points[:, 1], valid_points[:, 0]] += 1
        
        # Apply Gaussian blur using separable filters for better performance
        from scipy.ndimage import gaussian_filter1d
        heatmap = gaussian_filter1d(heatmap, sigma=30, axis=0)
        heatmap = gaussian_filter1d(heatmap, sigma=30, axis=1)
        heatmap = heatmap / np.max(heatmap)  # Normalize
        
        return heatmap
    
    def process_single_image(self, img_file, i, cache_path):
        """Process a single image and generate its heatmap."""
        # Load cached results
        image, gray, contour, mask = self.load_cached_results(cache_path)
        
        # Generate heatmap
        heatmap = self.generate_heatmap_vectorized(image, contour, mask)
        
        # Save image and heatmap
        base_name = f"{Path(img_file).stem}_{i}"
        cv2.imwrite(os.path.join(self.output_dir, 'images', f"{base_name}.jpg"), image)
        np.save(os.path.join(self.output_dir, 'heatmaps', f"{base_name}.npy"), heatmap)
        
        return True
    
    def generate_dataset(self):
        """Generate dataset of images and corresponding heatmaps using parallel processing."""
        image_files = [f for f in os.listdir(self.input_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
        total_tasks = len(image_files) * self.num_samples_per_image
        
        print(f"Starting dataset generation with {self.num_workers} workers")
        print(f"Processing {len(image_files)} images with {self.num_samples_per_image} samples each")
        print(f"Total tasks: {total_tasks}")
        
        # Preprocess all images and cache results
        print("Preprocessing images...")
        cache_paths = {}
        for img_file in tqdm(image_files, desc="Preprocessing"):
            img_path = os.path.join(self.input_dir, img_file)
            _, _, _, _, cache_path = self.preprocess_image(img_path)
            cache_paths[img_file] = cache_path
        
        # Create a list of all tasks
        tasks = []
        for img_file in image_files:
            for i in range(self.num_samples_per_image):
                tasks.append((img_file, i, cache_paths[img_file]))
        
        # Process tasks in parallel with progress bar
        with ProcessPoolExecutor(max_workers=self.num_workers) as executor:
            # Use partial to create a function with fixed parameters
            process_func = partial(self.process_single_image)
            
            # Submit all tasks and create progress bar
            futures = [executor.submit(process_func, task[0], task[1], task[2]) for task in tasks]
            
            # Track progress using tqdm
            with tqdm(total=total_tasks, desc="Generating heatmaps") as pbar:
                for future in as_completed(futures):
                    try:
                        future.result()
                        pbar.update(1)
                    except Exception as e:
                        print(f"\nError processing task: {e}")
                        pbar.update(1)
        
        print("\nDataset generation completed!")

class DataLoader:
    def __init__(self, dataset_dir, test_size=0.2, random_state=42):
        self.dataset_dir = dataset_dir
        self.test_size = test_size
        self.random_state = random_state
        self.image_dir = os.path.join(dataset_dir, 'images')
        self.heatmap_dir = os.path.join(dataset_dir, 'heatmaps')
        
    def load_data(self):
        """Load and preprocess the dataset."""
        image_files = [f for f in os.listdir(self.image_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
        X = []
        y = []
        
        for img_file in image_files:
            # Load image
            img_path = os.path.join(self.image_dir, img_file)
            image = cv2.imread(img_path)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            image = cv2.resize(image, (256, 256))  # Resize to model input size
            image = image / 255.0  # Normalize
            
            # Load corresponding heatmap
            heatmap_path = os.path.join(self.heatmap_dir, f"{Path(img_file).stem}.npy")
            heatmap = np.load(heatmap_path)
            heatmap = cv2.resize(heatmap, (256, 256))  # Resize to match image size
            
            X.append(image)
            y.append(heatmap)
        
        X = np.array(X)
        y = np.array(y)
        y = np.expand_dims(y, axis=-1)  # Add channel dimension for heatmap
        
        # Split into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=self.test_size, random_state=self.random_state
        )
        
        return X_train, X_test, y_train, y_test

class HeatmapPredictor:
    def __init__(self, input_shape=(256, 256, 3)):
        self.input_shape = input_shape
        self.model = self.build_model()
        
    def build_model(self):
        """Build a U-Net like model for heatmap prediction."""
        inputs = layers.Input(shape=self.input_shape)
        
        # Encoder
        conv1 = layers.Conv2D(64, 3, activation='relu', padding='same')(inputs)
        conv1 = layers.Conv2D(64, 3, activation='relu', padding='same')(conv1)
        pool1 = layers.MaxPooling2D(pool_size=(2, 2))(conv1)
        
        conv2 = layers.Conv2D(128, 3, activation='relu', padding='same')(pool1)
        conv2 = layers.Conv2D(128, 3, activation='relu', padding='same')(conv2)
        pool2 = layers.MaxPooling2D(pool_size=(2, 2))(conv2)
        
        # Middle
        conv3 = layers.Conv2D(256, 3, activation='relu', padding='same')(pool2)
        conv3 = layers.Conv2D(256, 3, activation='relu', padding='same')(conv3)
        
        # Decoder
        up2 = layers.UpSampling2D(size=(2, 2))(conv3)
        up2 = layers.Conv2D(128, 2, activation='relu', padding='same')(up2)
        merge2 = layers.concatenate([conv2, up2], axis=3)
        conv4 = layers.Conv2D(128, 3, activation='relu', padding='same')(merge2)
        conv4 = layers.Conv2D(128, 3, activation='relu', padding='same')(conv4)
        
        up1 = layers.UpSampling2D(size=(2, 2))(conv4)
        up1 = layers.Conv2D(64, 2, activation='relu', padding='same')(up1)
        merge1 = layers.concatenate([conv1, up1], axis=3)
        conv5 = layers.Conv2D(64, 3, activation='relu', padding='same')(merge1)
        conv5 = layers.Conv2D(64, 3, activation='relu', padding='same')(conv5)
        
        # Output
        outputs = layers.Conv2D(1, 1, activation='sigmoid')(conv5)
        
        model = models.Model(inputs=inputs, outputs=outputs)
        model.compile(optimizer='adam', loss='mse', metrics=['accuracy'])
        
        return model
    
    def train(self, train_images, train_heatmaps, validation_split=0.2, epochs=50, batch_size=32):
        """Train the model on the generated dataset."""
        self.model.fit(
            train_images,
            train_heatmaps,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size
        )
    
    def predict(self, image):
        """Predict heatmap for a new image."""
        return self.model.predict(np.expand_dims(image, axis=0))[0]
    
    def evaluate(self, X_test, y_test):
        """Evaluate the model on test data."""
        metrics = self.model.evaluate(X_test, y_test)
        print(f"Test Loss: {metrics[0]:.4f}")
        print(f"Test Accuracy: {metrics[1]:.4f}")
        
        # Generate predictions for a few test samples
        predictions = self.model.predict(X_test[:5])
        
        # Visualize predictions
        plt.figure(figsize=(15, 5))
        for i in range(5):
            plt.subplot(1, 5, i+1)
            plt.imshow(X_test[i])
            plt.imshow(predictions[i].squeeze(), cmap='jet', alpha=0.4)
            plt.axis('off')
            plt.title(f'Prediction {i+1}')
        plt.tight_layout()
        plt.savefig('ml/models/predictions.png')
        plt.close()

def main():
    # Initialize Google Cloud
    print("Initializing Google Cloud")
    aiplatform.init(project="eye-sense", location="us-central1")
    print("Google Cloud initialized")
    # Generate dataset
    generator = HeatmapDatasetGenerator(
        input_dir="ml/input_images",
        output_dir="ml/dataset",
        num_samples_per_image=5
    )
    print("Generating dataset")
    generator.generate_dataset()
    print("Dataset generated")

    # Load and split dataset
    print("Loading and splitting dataset")
    data_loader = DataLoader("ml/dataset")
    X_train, X_test, y_train, y_test = data_loader.load_data()
    print("Dataset loaded and split")
    
    # Initialize and train model
    print("Initializing and training model")
    predictor = HeatmapPredictor()
    predictor.train(X_train, y_train, validation_split=0.2, epochs=50, batch_size=32)
    print("Model trained")
    # Evaluate model
    print("Evaluating model")
    predictor.evaluate(X_test, y_test)
    print("Model evaluated")
    
    # Save model
    predictor.model.save("ml/models/heatmap_predictor")

if __name__ == "__main__":
    main() 