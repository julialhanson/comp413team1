#!/bin/bash
set -e

# Change to the directory containing the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$SCRIPT_DIR"

# --- Configuration ---
MODE=${1:-"train"}  # Default mode is train
IMAGE_PATH_ARG=${2:-""} # Image path for prediction mode

# Define standard directories relative to the script location
DEFAULT_INPUT_IMAGE_DIR="$SCRIPT_DIR/dataset/images" # Changed from input_images to dataset/images
DEFAULT_HEATMAP_DIR="$SCRIPT_DIR/dataset/heatmaps" # Where preprocessed heatmaps will be saved/loaded
MODEL_DIR="$SCRIPT_DIR/models/gcp_heatmap_predictor" # Where the trained model is saved/loaded

# --- Display Usage --- 
function show_usage {
  echo "Usage: $0 [preprocess|train|predict|both] [path/to/image.jpg]"
  echo "Modes:"
  echo "  preprocess - Generate heatmaps from images in '$DEFAULT_INPUT_IMAGE_DIR'"
  echo "               and save them to '$DEFAULT_HEATMAP_DIR'. (Run this once first)"
  echo "  train      - Train the model using images from '$DEFAULT_INPUT_IMAGE_DIR'"
  echo "               and preprocessed heatmaps from '$DEFAULT_HEATMAP_DIR'."
  echo "               Model saved to '$MODEL_DIR'"
  echo "  predict    - Run prediction using the saved model in '$MODEL_DIR'."
  echo "               Requires a path to an image (relative to project root or absolute)."
  echo "  both       - Run preprocess, then train, then predict on the specified image."
  echo ""
  echo "Examples:"
  echo "  $0 preprocess                 # Generate heatmaps"
  echo "  $0 train                      # Train the model"
  echo "  $0 predict ml/lesion.jpg      # Run prediction on an image"
  echo "  $0 both ml/lesion.jpg        # Preprocess, train, and predict"
}

# --- Setup Environment --- 
function setup_environment {
  echo "Setting up environment..."
  
  # Check if conda is available
  if command -v conda &> /dev/null; then
    # Check if eye_sense environment exists
    if conda env list | grep -q "eye_sense"; then
      echo "Activating existing conda environment 'eye_sense'..."
      
      # Source conda.sh to enable conda activate in this script
      if [ -f ~/miniconda3/etc/profile.d/conda.sh ]; then
        source ~/miniconda3/etc/profile.d/conda.sh
      elif [ -f ~/anaconda3/etc/profile.d/conda.sh ]; then
        source ~/anaconda3/etc/profile.d/conda.sh
      else
        echo "Warning: Cannot find conda.sh, trying direct activation"
      fi
      
      conda activate eye_sense
    else
      echo "Creating new conda environment 'eye_sense'..."
      conda create -y -n eye_sense python=3.9
      # Determine source path again for new shell
      CONDA_SOURCE_PATH=""
      if [ -f ~/miniconda3/etc/profile.d/conda.sh ]; then CONDA_SOURCE_PATH=~/miniconda3/etc/profile.d/conda.sh; fi
      if [ -f ~/anaconda3/etc/profile.d/conda.sh ]; then CONDA_SOURCE_PATH=~/anaconda3/etc/profile.d/conda.sh; fi
      if [ -n "$CONDA_SOURCE_PATH" ]; then source $CONDA_SOURCE_PATH; else echo "Warning: could not source conda.sh"; fi
      conda activate eye_sense
      echo "Installing required packages from requirements.txt..."
      pip install --upgrade pip
      pip install -r requirements.txt
    fi
  else
    echo "Conda not found. Using current Python environment."
    echo "Please ensure required packages are installed (see requirements.txt)"
  fi
  
  echo "Environment setup complete."
}

# --- Function to Preprocess Data ---
function preprocess_data {
  echo "--- Starting Preprocessing --- "
  # Ensure target directory exists
  mkdir -p "$DEFAULT_HEATMAP_DIR"
  
  echo "Running heatmap generation..."
  python et_bot.py --input-dir "$DEFAULT_INPUT_IMAGE_DIR" --output-dir "$DEFAULT_HEATMAP_DIR"
  
  local status=$?
  if [ $status -ne 0 ]; then
    echo "Error: Preprocessing (et_bot.py) failed with status $status"
    exit $status
  fi
  echo "--- Preprocessing Complete --- "
}


# --- Function to Train the Model --- 
function train_model {
  echo "--- Starting Model Training --- "
  
  # Check if preprocessed data exists
  if [ ! -d "$DEFAULT_INPUT_IMAGE_DIR" ] || [ ! "$(ls -A $DEFAULT_INPUT_IMAGE_DIR)" ]; then
     echo "Error: Input image directory '$DEFAULT_INPUT_IMAGE_DIR' is empty or does not exist." 
     exit 1
  fi
   if [ ! -d "$DEFAULT_HEATMAP_DIR" ] || [ ! "$(ls -A $DEFAULT_HEATMAP_DIR)" ]; then
     echo "Error: Preprocessed heatmap directory '$DEFAULT_HEATMAP_DIR' is empty or does not exist." 
     echo "Please run '$0 preprocess' first."
     exit 1
  fi

  # Ensure model save directory exists
  mkdir -p "$(dirname "$MODEL_DIR")"
  echo "Model will be saved to: $MODEL_DIR"
  
  # Run the training pipeline using the python class
  python -c "
import os
from gcp_heatmap_model import GCPHeatmapModel

# Define directories relative to the script location
script_dir = '$SCRIPT_DIR'
image_dir = os.path.join(script_dir, 'dataset', 'images')
heatmap_dir = os.path.join(script_dir, 'dataset', 'heatmaps')
model_base_dir = os.path.join(script_dir, 'models') 

print(f'Training with Images: {image_dir}')
print(f'Training with Heatmaps: {heatmap_dir}')
print(f'Saving Model to base directory: {model_base_dir}')

# Instantiate and run training
pipeline = GCPHeatmapModel(model_dir=model_base_dir)
model, history, metrics = pipeline.run_training_pipeline(
    image_dir=image_dir,
    heatmap_dir=heatmap_dir,
    epochs=5,      # Limit for faster testing, adjust as needed
    batch_size=16
)
"
  local status=$?
  if [ $status -ne 0 ]; then
    echo "Error: Training failed with status $status"
    exit $status
  fi
  
  echo "--- Model Training Completed --- "
  echo "Model saved in: $MODEL_DIR"
}

# --- Function to Run Prediction --- 
function run_prediction {
  if [ -z "$1" ]; then
    echo "Error: No image path provided for prediction."
    show_usage
    exit 1
  fi
  
  # Resolve image path relative to the project root (one level up from script dir)
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  IMAGE_PATH_ABS=""
  if [[ "$1" == /* ]]; then
    IMAGE_PATH_ABS="$1"
  else
    IMAGE_PATH_ABS="$PROJECT_ROOT/$1"
  fi
  
  echo "Running prediction on image: $IMAGE_PATH_ABS"
  
  # Check if image exists
  if [ ! -f "$IMAGE_PATH_ABS" ]; then
    echo "Error: Image not found at $IMAGE_PATH_ABS"
    exit 1
  fi
  
  # Check if model exists
  if [ ! -d "$MODEL_DIR" ]; then
    echo "Error: Model not found at $MODEL_DIR. Please train the model first using '$0 train'."
    exit 1
  fi
  
  PREDICTION_OUTPUT_PATH="$(dirname "$MODEL_DIR")/prediction_result.png"
  
  # Run prediction Python script
  python run_prediction.py --image "$IMAGE_PATH_ABS" --model "$MODEL_DIR" --output "$PREDICTION_OUTPUT_PATH"
  
  local status=$?
  if [ $status -ne 0 ]; then
    echo "Error: Prediction failed with status $status"
    exit $status
  fi
  
  echo "Prediction completed!"
  echo "Result saved to: $PREDICTION_OUTPUT_PATH"
}

# --- Main Execution Logic --- 
setup_environment

case $MODE in
  preprocess)
    preprocess_data
    ;;
  train)
    train_model
    ;;
  predict)
    # Make sure image path argument is provided for predict mode
    if [ -z "$IMAGE_PATH_ARG" ]; then
        echo "Error: Missing image path argument for 'predict' mode." >&2
        show_usage
        exit 1
    fi
    run_prediction "$IMAGE_PATH_ARG"
    ;;
  both)
     # Make sure image path argument is provided for both mode
    if [ -z "$IMAGE_PATH_ARG" ]; then
        echo "Error: Missing image path argument for 'both' mode." >&2
        show_usage
        exit 1
    fi
    preprocess_data
    train_model
    run_prediction "$IMAGE_PATH_ARG"
    ;;
  *)
    echo "Error: Invalid mode '$MODE'"
    show_usage
    exit 1
    ;;
esac

echo "All operations completed successfully!" 