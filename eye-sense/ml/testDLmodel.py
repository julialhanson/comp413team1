import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from PIL import Image

from DLmodel import mse_ssim_loss

model = tf.keras.models.load_model("lesion_heatmap_model.keras", custom_objects={"mse_ssim_loss": mse_ssim_loss})

# Load image
def load_test_image(path):
    raw = tf.io.read_file(path)
    img = tf.image.decode_jpeg(raw, channels=3)
    img = tf.image.resize(img, [256, 256])
    img = tf.cast(img, tf.float32) / 255.0
    return img, raw

# Load model


# Load image and run prediction
image_tensor, raw_image_bytes = load_test_image("lesion.jpg")
image_tensor_exp = tf.expand_dims(image_tensor, axis=0)  # (1, 256, 256, 3)
pred = model.predict(image_tensor_exp)[0]  # (256, 256, 1)

# Prepare heatmap
heatmap_gray = (pred[..., 0] * 255).astype("uint8")
heatmap_color = cm.jet(heatmap_gray / 255.0)[:, :, :3]  # drop alpha
heatmap_color = (heatmap_color * 255).astype("uint8")

# Blend heatmap with original image (PIL)
original_image = Image.open(tf.io.gfile.GFile("lesion.jpg", 'rb')).resize((256, 256))
heatmap_img = Image.fromarray(heatmap_color).resize((256, 256))
blended = Image.blend(original_image.convert("RGBA"), heatmap_img.convert("RGBA"), alpha=0.5)

# Show or save
blended.show()  # or blended.save("heatmap_overlay.png")
