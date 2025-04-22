import os
import cv2
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from ultralytics import YOLO  # Install via: pip install ultralytics
from .segmentation_model import segment_lesion  # our new function


# ------------------------------------------------------------------
# Load Models
# ------------------------------------------------------------------
# Lesion detection model (skin lesion classification)
LESION_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../backend/models/skin_lesion_model.keras')
lesion_model = load_model(LESION_MODEL_PATH)

# Dedicated classifier for verifying skin images.
SKIN_CLASSIFIER_PATH = os.path.join(os.path.dirname(__file__), 'skin_classifier.keras')
try:
    skin_classifier = load_model(SKIN_CLASSIFIER_PATH)
except Exception as e:
    print("Warning: Skin classifier model not found. Using a dummy classifier that returns 'skin'.")
    class DummyClassifier:
        def predict(self, image_array):
            # Always returns a high probability indicating a skin image.
            return np.array([[1.0]])
    skin_classifier = DummyClassifier()

# Load YOLOv5s model via ultralytics (auto-downloads if not present)
yolo_model = YOLO("yolov5s.pt")

# ------------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------------
def preprocess_image(image_path, target_size=(224, 224)):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0  # Normalize pixel values
    image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
    return image_array

def detect_face_yolo(image_path, confidence_threshold=0.5):
    """
    Uses the YOLOv5s model to detect persons. If any detection with class "person"
    is found at or above the given confidence threshold, returns True.
    """
    results = yolo_model(image_path)
    for result in results:
        for box in result.boxes:
            conf = box.conf.item()
            cls_id = int(box.cls.item())
            class_name = result.names.get(cls_id, "")
            if conf >= confidence_threshold and class_name == "person":
                return True
    return False

def is_skin_image_classifier(image_path):
    """
    Uses the dedicated binary classifier to determine if the image is a valid skin image.
    Returns True if the classifier predicts it as skin (probability >= 0.5).
    """
    image_array = preprocess_image(image_path)
    pred = skin_classifier.predict(image_array)
    return pred[0][0] >= 0.5

def is_skin_color_image(image_path, skin_threshold=0.2):
    """
    A simple heuristic: converts the image to HSV and calculates the fraction of pixels
    that fall into typical skin tone ranges. Returns True if the ratio exceeds skin_threshold.
    (Note: This heuristic may need tuning for your images.)
    """
    image = cv2.imread(image_path)
    if image is None:
        return False
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    # Define a plausible skin color range in HSV.
    # These values are rough and might need to be adjusted.
    lower_skin = np.array([0, 30, 60], dtype=np.uint8)
    upper_skin = np.array([20, 150, 255], dtype=np.uint8)
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    skin_pixels = cv2.countNonZero(mask)
    total_pixels = image.shape[0] * image.shape[1]
    ratio = skin_pixels / total_pixels
    # Debug output (optional): print("Skin pixel ratio:", ratio)
    return ratio >= skin_threshold

# ------------------------------------------------------------------
# Integrated Prediction Pipeline
# ------------------------------------------------------------------
def predict(image_path):
    # Step 1: Reject images that contain a person using YOLO.
    if detect_face_yolo(image_path):
        return "Invalid", "Please post a skin image (person detected)."
    
    # Step 2: Use the dedicated skin classifier to verify that the image is a skin image.
    if not is_skin_image_classifier(image_path):
        return "Invalid", "Please post a skin image (classifier rejected non-skin content)."
    
    # Step 3: Apply an HSV-based skin color check to further verify skin content.
    if not is_skin_color_image(image_path, skin_threshold=0.2):
        return "Invalid", "Please post a valid skin image (insufficient skin tone detected)."
    
    # Step 4: Run lesion detection using your model.
    image_array = preprocess_image(image_path)
    prediction = lesion_model.predict(image_array)
    if prediction[0][0] >= 0.5:
        label = "Malignant"
        confidence = prediction[0][0] * 100
    else:
        label = "Benign"
        confidence = (1 - prediction[0][0]) * 100
    return label, float(round(confidence, 2))
