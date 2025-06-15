import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import cv2

# Path to your trained U‑Net segmentation model
SEGMENTATION_MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    'skin_segmentation_model.keras'
)
# Load once at import time
seg_model = load_model(SEGMENTATION_MODEL_PATH)

def segment_lesion(image_path, target_size=(224,224)):
    """
    1) Load image, resize to model input.
    2) Run U‑Net to get a mask.
    3) Apply mask to original image and crop to bounding box of lesion.
    Returns: cropped lesion-image as a numpy array.
    """
    # 1. Load & preprocess
    orig = Image.open(image_path).convert('RGB')
    orig_arr = np.array(orig)
    img = orig.resize(target_size)
    img_arr = np.array(img) / 255.0
    img_arr = np.expand_dims(img_arr, 0)  # (1, H, W, 3)

    # 2. Predict mask
    mask = seg_model.predict(img_arr)[0, :, :, 0]  # (H, W)
    mask = (mask > 0.5).astype(np.uint8)  # binary mask

    # 3. Upscale mask to original resolution
    mask_full = cv2.resize(mask, (orig_arr.shape[1], orig_arr.shape[0]), interpolation=cv2.INTER_NEAREST)
    # Find bounding box of mask
    ys, xs = np.where(mask_full == 1)
    if len(xs) == 0 or len(ys) == 0:
        # fallback: use whole image
        return orig_arr
    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()
    # Crop lesion region
    cropped = orig_arr[y1:y2, x1:x2]
    # Resize crop back to classifier input size
    cropped = cv2.resize(cropped, target_size)
    return cropped
