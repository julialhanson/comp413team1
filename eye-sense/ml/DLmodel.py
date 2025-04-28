import os
import argparse
import tensorflow as tf
from glob import glob
from tensorflow.keras import layers, models

# CONFIG
IMG_SIZE = 256
BATCH_SIZE = 8
EPOCHS = 30
AUTOTUNE = tf.data.AUTOTUNE


def load_image_pair(img_path, heatmap_path):
    image = tf.io.read_file(img_path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
    image = tf.cast(image, tf.float32) / 255.0

    heatmap = tf.io.read_file(heatmap_path)
    heatmap = tf.image.decode_png(heatmap, channels=1)
    heatmap = tf.image.resize(heatmap, [IMG_SIZE, IMG_SIZE])
    heatmap = tf.cast(heatmap, tf.float32) / 255.0

    return image, heatmap

from tensorflow.keras.saving import register_keras_serializable

@register_keras_serializable()
def mse_ssim_loss(y_true, y_pred):
    mse = tf.reduce_mean(tf.square(y_true - y_pred))
    ssim = tf.reduce_mean(tf.image.ssim(y_true, y_pred, max_val=1.0))
    return mse - ssim  # maximize SSIM while minimizing MSE

def get_dataset(image_dir, heatmap_dir):
    image_paths = sorted(glob(os.path.join(image_dir, "*")))
    heatmap_paths = sorted(glob(os.path.join(heatmap_dir, "*")))

    dataset = tf.data.Dataset.from_tensor_slices((image_paths, heatmap_paths))
    dataset = dataset.cache()
    dataset = dataset.map(lambda x, y: load_image_pair(x, y), num_parallel_calls=AUTOTUNE)
    return dataset.shuffle(200).batch(BATCH_SIZE).prefetch(AUTOTUNE)

def build_model(input_shape=(IMG_SIZE, IMG_SIZE, 3)):
    base_model = tf.keras.applications.EfficientNetB3(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Enable later for fine-tuning

    inputs = tf.keras.Input(shape=input_shape)
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base_model(x)  # Output shape: ~8x8x1536

    # Decoder: upsample to 256x256
    x = layers.Conv2D(256, 3, padding='same', activation='relu')(x)
    x = layers.UpSampling2D(2)(x)  # 16x16
    x = layers.Conv2D(128, 3, padding='same', activation='relu')(x)
    x = layers.UpSampling2D(2)(x)  # 32x32
    x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
    x = layers.UpSampling2D(2)(x)  # 64x64
    x = layers.Conv2D(32, 3, padding='same', activation='relu')(x)
    x = layers.UpSampling2D(2)(x)  # 128x128
    x = layers.Conv2D(16, 3, padding='same', activation='relu')(x)
    x = layers.UpSampling2D(2)(x)  # 256x256

    outputs = layers.Conv2D(1, 1, activation='sigmoid', dtype='float32')(x)
    return tf.keras.Model(inputs, outputs)


def main(args):
    print("Preparing dataset...")
    dataset = get_dataset(args.image_dir, args.heatmap_dir)
    total = tf.data.experimental.cardinality(dataset).numpy()
    train_size = int(0.8 * total)
    train_ds = dataset.take(train_size)
    val_ds = dataset.skip(train_size)

    print("Building and training model...")
    model = build_model()
    print("Compiling model...")
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-4), loss=mse_ssim_loss, metrics=['mae'])
    print("Fitting model...")
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS)

    print("Saving model locally...")
    model.save(args.model_dir + ".keras")

    if args.test_image:
        print(f"Running inference on: {args.test_image}")

        def load_test_image(path):
            image = tf.io.read_file(path)
            image = tf.image.decode_jpeg(image, channels=3)
            image = tf.image.resize(image, [IMG_SIZE, IMG_SIZE])
            image = tf.cast(image, tf.float32) / 255.0
            return image[None, ...], image

        test_img_batch, test_img_vis = load_test_image(args.test_image)
        pred_heatmap = model.predict(test_img_batch, verbose=0)[0]

        import matplotlib.pyplot as plt
        import matplotlib.cm as cm
        from PIL import Image

        heatmap_img = (pred_heatmap[..., 0] * 255).astype("uint8")
        heatmap_colored = cm.jet(heatmap_img / 255.0)[..., :3]  # Drop alpha
        heatmap_colored = (heatmap_colored * 255).astype("uint8")

        original_image = Image.open(args.test_image).resize((256, 256)).convert("RGBA")
        heatmap_overlay = Image.fromarray(heatmap_colored).convert("RGBA")
        blended = Image.blend(original_image, heatmap_overlay, alpha=0.5)

        blended.show()
        blended.save("predicted_heatmap_overlay.png")
        print("Saved overlay to predicted_heatmap_overlay.png")

    if args.vertex_deploy:
        print("Uploading to GCS and deploying to Vertex AI...")
        os.system(f"gsutil -m cp -r {args.model_dir} gs://{args.bucket}/{args.model_dir}")
        print("Run the following to deploy:")
        print(f"""
        gcloud ai models upload \
          --region={args.region} \
          --display-name=heatmap-model \
          --artifact-uri=gs://{args.bucket}/{args.model_dir} \
          --container-image-uri=gcr.io/cloud-aiplatform/prediction/tf2-cpu.2-11:latest

        gcloud ai endpoints create \
          --region={args.region} \
          --display-name=heatmap-endpoint

        gcloud ai endpoints deploy-model [ENDPOINT_ID] \
          --model=[MODEL_ID] \
          --region={args.region} \
          --display-name=heatmap-model \
          --traffic-split=0=100
        """)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image_dir", default="dataset/images")
    parser.add_argument("--heatmap_dir", default="dataset/heatmaps")
    parser.add_argument("--model_dir", default="lesion_heatmap_model")
    parser.add_argument("--vertex_deploy", action="store_true")
    parser.add_argument("--bucket", help="GCS bucket name")
    parser.add_argument("--region", default="us-central1")
    parser.add_argument("--test_image", help="Path to an image to test the model on")

    args = parser.parse_args()
    main(args)