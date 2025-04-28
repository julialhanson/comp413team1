# GCP Heatmap Model Integration

This module integrates the ET_Bot algorithm with Google Cloud Storage to generate training data for a heatmap prediction model.

## Setup

### Prerequisites

1. Google Cloud Platform account with a project set up
2. A GCP bucket with lesion images
3. Python 3.8+ installed

### Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Set up Google Cloud authentication:

```bash
# Option 1: Login with your Google account
gcloud auth application-default login

# Option 2: Use a service account key
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
```

## Usage

### Basic Usage

Run the model with default settings:

```bash
python run_gcp_model.py --bucket your-bucket-name
```

### Advanced Usage

```bash
python run_gcp_model.py \
    --bucket your-bucket-name \
    --prefix folder/subfolder/ \
    --max-images 200 \
    --test-size 0.25 \
    --epochs 50 \
    --batch-size 32 \
    --model-dir ml/custom_models
```

### Parameters

- `--bucket`: (Required) Name of your GCP bucket
- `--prefix`: Folder path prefix within the bucket (default: empty, uses root)
- `--max-images`: Maximum number of images to use (default: None, uses all)
- `--test-size`: Fraction of data to use for testing (default: 0.2)
- `--epochs`: Number of training epochs (default: 20)
- `--batch-size`: Batch size for training (default: 16)
- `--model-dir`: Directory to save models (default: ml/models)

## How It Works

1. **Image Loading**: The script downloads images from your GCP bucket to a temporary directory
2. **Heatmap Generation**: For each image, a heatmap is generated using the ET_Bot algorithm
3. **Dataset Creation**: The images and heatmaps are split into training and test sets
4. **Model Training**: A U-Net style model is trained to predict heatmaps from images
5. **Evaluation**: The model is evaluated on the test set and example predictions are visualized

## Output

After training completes, the script will:
1. Save the trained model to `[model-dir]/gcp_heatmap_predictor`
2. Save visualization of predictions to `[model-dir]/gcp_predictions.png`
3. Print test metrics (loss and accuracy)

## Using the Trained Model

```python
import tensorflow as tf

# Load the saved model
model = tf.keras.models.load_model('ml/models/gcp_heatmap_predictor')

# Preprocess an image
import cv2
import numpy as np

image = cv2.imread('path/to/image.jpg')
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
image = cv2.resize(image, (256, 256))
image = image / 255.0
image = np.expand_dims(image, axis=0)  # Add batch dimension

# Generate prediction
prediction = model.predict(image)[0]

# Visualize prediction
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.imshow(image[0])
plt.title('Original Image')
plt.axis('off')

plt.subplot(1, 2, 2)
plt.imshow(image[0])
plt.imshow(prediction.squeeze(), cmap='jet', alpha=0.4)
plt.title('Predicted Heatmap')
plt.axis('off')

plt.tight_layout()
plt.show()
```

## Troubleshooting

- **Authentication Issues**: Make sure you've set up GCP authentication correctly
- **Memory Errors**: Reduce batch size or max_images if you encounter memory issues
- **Slow Processing**: Try reducing the number of images or running on a machine with more cores
- **Model Accuracy**: Try increasing epochs or adding more training data 