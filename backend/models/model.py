import os
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from ultralytics import YOLO  # Install via: pip install ultralytics

# ------------------------------------------------------------------
# Load Models
# ------------------------------------------------------------------
# Lesion detection model (skin lesion classification)
LESION_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../backend/models/skin_lesion_model.keras')
lesion_model = load_model(LESION_MODEL_PATH)

# Dedicated binary classifier for skin images.
SKIN_CLASSIFIER_PATH = os.path.join(os.path.dirname(__file__), 'skin_classifier.keras')
try:
    skin_classifier = load_model(SKIN_CLASSIFIER_PATH)
except Exception as e:
    print("Warning: Skin classifier model not found. Using a dummy classifier that returns skin for all images.")
    class DummyClassifier:
        def predict(self, image_array):
            return np.array([[1.0]])
    skin_classifier = DummyClassifier()

# YOLO model via ultralytics (YOLOv5s auto-downloads if not present)
yolo_model = YOLO("yolov5s.pt")

# ------------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------------
def preprocess_image(image_path, target_size=(224, 224)):
    image = Image.open(image_path).convert('RGB')
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0  # Normalize to [0,1]
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

def detect_face_yolo(image_path, confidence_threshold=0.5):
    """
    Uses the ultralytics YOLOv5s model to detect persons in the image.
    Returns True if a detection with class 'person' is found.
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
    Uses the dedicated classifier to determine if the image is a valid skin image.
    Returns True if the classifier predicts it as skin.
    """
    image_array = preprocess_image(image_path)
    pred = skin_classifier.predict(image_array)
    return pred[0][0] >= 0.5

# ------------------------------------------------------------------
# Integrated Prediction Pipeline
# ------------------------------------------------------------------
def predict(image_path):
    # Step 1: Use YOLO-based object detection to filter images containing people.
    if detect_face_yolo(image_path):
        return "Invalid", "Please post a skin image (person/object detected)."
    
    # Step 2: Use the dedicated skin classifier to verify the image is a skin image.
    if not is_skin_image_classifier(image_path):
        return "Invalid", "Please post a skin image (non-skin content detected)."
    
    # Step 3: Run the lesion detection model.
    image_array = preprocess_image(image_path)
    prediction = lesion_model.predict(image_array)
    if prediction[0][0] >= 0.5:
        label = 'Malignant'
        confidence = prediction[0][0] * 100
    else:
        label = 'Benign'
        confidence = (1 - prediction[0][0]) * 100
    return label, float(round(confidence, 2))
