"""
Script to run the GCP Heatmap Model on GCP bucket images.
"""
import argparse
import os
from gcp_heatmap_model import GCPHeatmapModel

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Train a heatmap prediction model using images from a GCP bucket')
    parser.add_argument('--bucket', type=str, required=True, help='GCP bucket name')
    parser.add_argument('--prefix', type=str, default='', help='Prefix for images in bucket')
    parser.add_argument('--max-images', type=int, default=None, help='Maximum number of images to use')
    parser.add_argument('--test-size', type=float, default=0.2, help='Fraction of data to use for testing')
    parser.add_argument('--epochs', type=int, default=20, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=16, help='Batch size for training')
    parser.add_argument('--model-dir', type=str, default='ml/models', help='Directory to save models')
    parser.add_argument('--service-account-key', type=str, help='gcp_cred.json')
    
    args = parser.parse_args()
    
    # Set service account key environment variable if provided
    if args.service_account_key:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = args.service_account_key
        print(f"Using service account key: {args.service_account_key}")
    else:
        # Check if the environment variable is already set
        creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if creds_path:
            print(f"Using GOOGLE_APPLICATION_CREDENTIALS from environment: {creds_path}")
        else:
            print("WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
            print("Please set it using --service-account-key or by setting the environment variable.")
            print("Example: export GOOGLE_APPLICATION_CREDENTIALS='/path/to/key.json'")
            return
    
    # Create and run the model
    try:
        model = GCPHeatmapModel(
            bucket_name=args.bucket,
            model_dir=args.model_dir
        )
        
        # Run the training pipeline
        _, _, metrics = model.run_pipeline(
            image_prefix=args.prefix,
            max_images=args.max_images,
            test_size=args.test_size,
            epochs=args.epochs,
            batch_size=args.batch_size
        )
        
        print("\nTraining complete!")
        print(f"Test Loss: {metrics[0]:.4f}")
        print(f"Test Accuracy: {metrics[1]:.4f}")
        print(f"Model saved to {args.model_dir}/gcp_heatmap_predictor")
        print(f"Prediction examples saved to {args.model_dir}/gcp_predictions.png")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check your service account key has the right permissions")
        print("2. Verify your bucket name is correct")
        print("3. Make sure images exist at the specified prefix path")

if __name__ == "__main__":
    main() 