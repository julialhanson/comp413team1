import os
import tempfile
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import cv2
from google.cloud import storage
from pathlib import Path
from tqdm import tqdm
import time

class GCPHeatmapModel:
    def __init__(self, bucket_name=None, model_dir='ml/models', image_size=(256, 256)):
        self.bucket_name = bucket_name
        self.model_dir = os.path.abspath(model_dir)
        self.image_size = image_size
        self.ensure_directories()
        self.storage_client = None
        self.bucket = None
        print(f"GCPHeatmapModel initialized. Model directory: {self.model_dir}")
        
    def ensure_directories(self):
        """Create necessary directories if they don't exist."""
        os.makedirs(self.model_dir, exist_ok=True)
    
    def build_dataset(self, image_dir, heatmap_dir, test_size=0.2):
        """Build training dataset from directories of images and heatmaps."""
        X = []
        y = []
        
        image_filenames = sorted([f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
        
        print(f"Building dataset from: {image_dir} and {heatmap_dir}")
        
        for img_filename in tqdm(image_filenames, desc="Loading Dataset"):
            base_name = os.path.splitext(img_filename)[0]
            heatmap_filename = base_name + '_heatmap.png'
            
            img_path = os.path.join(image_dir, img_filename)
            heatmap_path = os.path.join(heatmap_dir, heatmap_filename)
            
            if not os.path.exists(heatmap_path):
                print(f"Warning: Heatmap not found for {img_filename} at {heatmap_path}. Skipping.")
                continue
            
            # Load image
            image = cv2.imread(img_path)
            if image is None:
                print(f"Warning: Could not load image {img_path}. Skipping.")
                continue
            
            # Enhanced preprocessing
            # 1. Convert to LAB color space for better color normalization
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # 2. CLAHE on L channel
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            l = clahe.apply(l)
            
            # 3. Merge back and convert to BGR
            lab = cv2.merge([l, a, b])
            enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
            
            # 4. Resize with better quality
            image_resized = cv2.resize(enhanced, self.image_size, interpolation=cv2.INTER_LANCZOS4)
            
            # Load and process heatmap
            heatmap = cv2.imread(heatmap_path, cv2.IMREAD_GRAYSCALE)
            if heatmap is None:
                print(f"Warning: Could not load heatmap {heatmap_path}. Skipping.")
                continue
            
            heatmap_resized = cv2.resize(heatmap, self.image_size)
            
            # Normalize image and heatmap
            image_normalized = image_resized / 255.0
            heatmap_normalized = heatmap_resized / 255.0
            
            X.append(image_normalized)
            y.append(np.expand_dims(heatmap_normalized, axis=-1))
        
        if not X:
            raise ValueError(f"No valid image/heatmap pairs found in {image_dir} and {heatmap_dir}.")
        
        X = np.array(X)
        y = np.array(y)
        
        # Split with stratification if possible
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        print(f"Dataset loaded: {len(X_train)} training samples, {len(X_test)} test samples")
        return X_train, X_test, y_train, y_test
    
    def build_model(self):
        """Build an enhanced U-Net with attention and residual connections."""
        input_shape = (*self.image_size, 3)
        
        def conv_block(x, filters, kernel_size=3, use_residual=True):
            shortcut = x
            
            # Efficient convolution with grouped channels
            x = layers.Conv2D(filters, 1, padding='same')(x)  # Channel reduction
            x = layers.BatchNormalization()(x)
            x = layers.Activation('relu')(x)
            
            x = layers.DepthwiseConv2D(kernel_size, padding='same')(x)  # Spatial features
            x = layers.BatchNormalization()(x)
            x = layers.Activation('relu')(x)
            
            x = layers.Conv2D(filters, 1, padding='same')(x)  # Channel expansion
            x = layers.BatchNormalization()(x)
            
            if use_residual:
                if shortcut.shape[-1] != filters:
                    shortcut = layers.Conv2D(filters, 1, padding='same')(shortcut)
                x = layers.Add()([shortcut, x])
            
            x = layers.Activation('relu')(x)
            x = layers.Dropout(0.1)(x)
            return x
        
        def attention_block(x, g, filters):
            theta_x = layers.Conv2D(filters // 2, 1, strides=1)(x)
            phi_g = layers.Conv2D(filters // 2, 1, strides=1)(g)
            
            f = layers.Activation('relu')(layers.Add()([theta_x, phi_g]))
            psi_f = layers.Conv2D(1, 1, strides=1)(f)
            
            rate = layers.Activation('sigmoid')(psi_f)
            att_x = layers.Multiply()([x, rate])
            
            return att_x
        
        # Encoder
        inputs = layers.Input(shape=input_shape)
        
        # Initial feature extraction
        x = conv_block(inputs, 32, use_residual=False)
        
        # Encoder path with skip connections
        conv1 = conv_block(x, 64)
        pool1 = layers.MaxPooling2D(pool_size=(2, 2))(conv1)
        
        conv2 = conv_block(pool1, 128)
        pool2 = layers.MaxPooling2D(pool_size=(2, 2))(conv2)
        
        conv3 = conv_block(pool2, 256)
        pool3 = layers.MaxPooling2D(pool_size=(2, 2))(conv3)
        
        # Bridge
        bridge = conv_block(pool3, 512)
        
        # Decoder path with attention
        up3 = layers.UpSampling2D(size=(2, 2))(bridge)
        att3 = attention_block(conv3, up3, 256)
        up3 = layers.concatenate([up3, att3])
        up3 = conv_block(up3, 256)
        
        up2 = layers.UpSampling2D(size=(2, 2))(up3)
        att2 = attention_block(conv2, up2, 128)
        up2 = layers.concatenate([up2, att2])
        up2 = conv_block(up2, 128)
        
        up1 = layers.UpSampling2D(size=(2, 2))(up2)
        att1 = attention_block(conv1, up1, 64)
        up1 = layers.concatenate([up1, att1])
        up1 = conv_block(up1, 64)
        
        # Efficient output layers with spatial attention
        outputs = layers.Conv2D(32, 3, padding='same', activation='relu')(up1)
        outputs = layers.Conv2D(1, 1, activation='sigmoid')(outputs)
        
        model = models.Model(inputs=inputs, outputs=outputs)
        
        # Combined loss function
        def combined_loss(y_true, y_pred):
            # Binary Cross-Entropy
            bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
            
            # Dice Loss
            smooth = 1e-6
            y_true_f = tf.reshape(y_true, [-1])
            y_pred_f = tf.reshape(y_pred, [-1])
            intersection = tf.reduce_sum(y_true_f * y_pred_f)
            dice = 1 - (2. * intersection + smooth) / (
                tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth)
            
            # Focal components to handle class imbalance
            alpha = 0.25
            gamma = 2.0
            focal = alpha * tf.pow(1. - y_pred, gamma) * bce
            
            return bce + dice + 0.5 * focal
        
        model.compile(
            optimizer=tf.keras.optimizers.legacy.Adam(
                learning_rate=0.001,
                decay=0.0001
            ),
            loss=combined_loss,
            metrics=[
                'accuracy',
                tf.keras.metrics.MeanIoU(num_classes=2),
                tf.keras.metrics.Recall(),
                tf.keras.metrics.Precision()
            ]
        )
        
        return model
    
    def train_model(self, X_train, y_train, validation_split=0.1, epochs=50, batch_size=8):
        """Train with improved augmentation and learning rate scheduling."""
        model = self.build_model()
        
        # Advanced data augmentation
        data_augmentation = tf.keras.Sequential([
            layers.RandomFlip("horizontal_and_vertical"),
            layers.RandomRotation(0.2),
            layers.RandomZoom(0.2),
            layers.RandomBrightness(0.2),
            layers.RandomContrast(0.2),
            layers.GaussianNoise(0.01),
            layers.RandomTranslation(0.1, 0.1),
        ])
        
        # Learning rate schedule with warmup
        initial_learning_rate = 0.001
        warmup_epochs = 5
        decay_epochs = epochs - warmup_epochs
        
        def warmup_cosine_decay(epoch):
            if epoch < warmup_epochs:
                return initial_learning_rate * (epoch + 1) / warmup_epochs
            else:
                progress = (epoch - warmup_epochs) / decay_epochs
                return initial_learning_rate * 0.5 * (1 + np.cos(np.pi * progress))
        
        # Enhanced callbacks
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                min_delta=0.0001
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=7,
                min_lr=0.000001,
                min_delta=0.0001
            ),
            tf.keras.callbacks.LearningRateScheduler(warmup_cosine_decay),
            tf.keras.callbacks.ModelCheckpoint(
                filepath=os.path.join(self.model_dir, 'best_model.h5'),
                save_best_only=True,
                monitor='val_loss',
                mode='min'
            )
        ]
        
        # Apply augmentation to training data
        def augment_data(image, label):
            image = data_augmentation(image)
            return image, label
        
        train_dataset = tf.data.Dataset.from_tensor_slices((X_train, y_train))
        train_dataset = train_dataset.shuffle(1000)
        train_dataset = train_dataset.map(augment_data, num_parallel_calls=tf.data.AUTOTUNE)
        train_dataset = train_dataset.batch(batch_size)
        train_dataset = train_dataset.prefetch(tf.data.AUTOTUNE)
        
        # Train the model
        history = model.fit(
            train_dataset,
            validation_split=validation_split,
            epochs=epochs,
            callbacks=callbacks
        )
        
        return model, history
    
    def evaluate_model(self, model, X_test, y_test):
        """Evaluate model with detailed metrics and visualization."""
        # Get predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        metrics = {
            'loss': model.evaluate(X_test, y_test)[0],
            'accuracy': model.evaluate(X_test, y_test)[1],
            'iou': model.evaluate(X_test, y_test)[2],
            'recall': model.evaluate(X_test, y_test)[3],
            'precision': model.evaluate(X_test, y_test)[4]
        }
        
        # Visualize results
        num_samples = min(5, len(X_test))  # Show up to 5 samples
        fig, axes = plt.subplots(num_samples, 3, figsize=(15, 5 * num_samples))
        
        for i in range(num_samples):
            # Original image
            axes[i, 0].imshow(X_test[i])
            axes[i, 0].set_title('Original Image')
            axes[i, 0].axis('off')
            
            # Ground truth heatmap
            axes[i, 1].imshow(y_test[i, :, :, 0], cmap='hot')
            axes[i, 1].set_title('Ground Truth')
            axes[i, 1].axis('off')
            
            # Predicted heatmap
            axes[i, 2].imshow(y_pred[i, :, :, 0], cmap='hot')
            axes[i, 2].set_title('Prediction')
            axes[i, 2].axis('off')
        
        plt.tight_layout()
        
        # Save visualization
        plt.savefig(os.path.join(self.model_dir, 'evaluation_results.png'))
        plt.close()
        
        print("\nEvaluation Metrics:")
        for metric, value in metrics.items():
            print(f"{metric}: {value:.4f}")
        
        return metrics, y_pred
    
    def predict_on_image(self, image_path, model_path=None, output_path=None):
        """Load a saved model and make a prediction on a new image.
        
        Args:
            image_path: Path to the input image.
            model_path: Path to the saved model. If None, uses the default path.
            output_path: Path to save the visualization. If None, uses a default path.
            
        Returns:
            The predicted heatmap as a numpy array.
        """
        # Make paths absolute
        image_path_abs = os.path.abspath(image_path)
        if model_path is None:
             model_path_abs = os.path.join(self.model_dir, 'gcp_heatmap_predictor')
        else:
             model_path_abs = os.path.abspath(model_path)
        
        print(f"Image path: {image_path_abs}")
        print(f"Model path: {model_path_abs}")
        
        # Check if image exists
        if not os.path.exists(image_path_abs):
            raise FileNotFoundError(f"Image not found at {image_path_abs}")
        
        # Check if model exists
        if not os.path.exists(model_path_abs):
            raise FileNotFoundError(f"Model not found at {model_path_abs}. Please train the model first.")
        
        print(f"Loading model from {model_path_abs}")
        
        try:
            # Load the model
            model = tf.keras.models.load_model(model_path_abs)
            print(f"Model loaded successfully")
            
            # Load and preprocess the image
            image = cv2.imread(image_path_abs)
            if image is None:
                raise ValueError(f"Could not load image at {image_path_abs}")
            
            print(f"Image loaded: {image_path_abs} (shape: {image.shape})")
            
            # Resize image
            image_resized = cv2.resize(image, self.image_size)
            
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
                # Default save location within the main model directory
                output_path_abs = os.path.join(self.model_dir, 'prediction_result.png') 
            else:
                output_path_abs = os.path.abspath(output_path)
            
            os.makedirs(os.path.dirname(output_path_abs), exist_ok=True)
            plt.savefig(output_path_abs)
            print(f"Prediction saved to {output_path_abs}")
            plt.close()
            
            return heatmap
            
        except Exception as e:
            print(f"Error during prediction: {str(e)}")
            raise

    def run_training_pipeline(self, image_dir='ml/dataset/images', heatmap_dir='ml/dataset/heatmaps', test_size=0.2, epochs=50, batch_size=8):
        """Run the training pipeline using existing images and heatmaps."""
        print(f"Loading dataset from {image_dir} and {heatmap_dir}...")
        
        # Load and preprocess images and heatmaps
        X = []
        y = []
        
        # Get all image files
        image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img_file in tqdm(image_files, desc="Loading dataset"):
            # Get corresponding heatmap filename
            base_name = os.path.splitext(img_file)[0]
            heatmap_file = f"{base_name}_heatmap.png"
            
            if not os.path.exists(os.path.join(heatmap_dir, heatmap_file)):
                print(f"Warning: No matching heatmap found for {img_file}")
                continue
            
            # Load and preprocess image
            img_path = os.path.join(image_dir, img_file)
            image = cv2.imread(img_path)
            if image is None:
                print(f"Warning: Could not load image {img_path}")
                continue
            
            # Resize and normalize image
            image = cv2.resize(image, self.image_size)
            image = image / 255.0
            
            # Load and preprocess heatmap
            heatmap_path = os.path.join(heatmap_dir, heatmap_file)
            heatmap = cv2.imread(heatmap_path, cv2.IMREAD_GRAYSCALE)
            if heatmap is None:
                print(f"Warning: Could not load heatmap {heatmap_path}")
                continue
            
            # Resize and normalize heatmap
            heatmap = cv2.resize(heatmap, self.image_size)
            heatmap = heatmap / 255.0
            heatmap = np.expand_dims(heatmap, axis=-1)
            
            X.append(image)
            y.append(heatmap)
        
        if not X:
            raise ValueError("No valid image/heatmap pairs found in the dataset")
        
        X = np.array(X)
        y = np.array(y)
        
        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        print(f"Dataset loaded: {len(X_train)} training samples, {len(X_test)} test samples")
        
        # Train model
        print("Training model...")
        model, history = self.train_model(X_train, y_train, epochs=epochs, batch_size=batch_size)
        
        # Evaluate model
        print("Evaluating model...")
        metrics, y_pred = self.evaluate_model(model, X_test, y_test)
        
        print("Training pipeline completed.")
        return model, history, metrics, y_pred

if __name__ == "__main__":
    print("This script defines the GCPHeatmapModel class.")
    print("To preprocess data, run: python ml/et_bot.py --input-dir <...> --output-dir <...>")
    print("To train the model, use the 'train' mode in run_eye_sense_model.sh")
    print("To predict, use the 'predict' mode in run_eye_sense_model.sh")
    
    # Example of how to manually instantiate and train if needed:
    # image_directory = 'path/to/your/images'
    # heatmap_directory = 'path/to/your/heatmaps'
    # model_directory = 'ml/models' 
    # pipeline = GCPHeatmapModel(model_dir=model_directory)
    # pipeline.run_training_pipeline(image_directory, heatmap_directory, epochs=10) 