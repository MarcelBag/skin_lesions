import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
import os

# Update the path: from backend/models/model.py, go up one level then into backend/models/
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../backend/models/skin_lesion_model.keras')
model = load_model(MODEL_PATH)

def preprocess_image(image_path, target_size=(224, 224)):
    image = Image.open(image_path).convert('RGB')
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0  # Normalize to [0,1]
    image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
    return image_array

def predict(image_path):
    image_array = preprocess_image(image_path)
    prediction = model.predict(image_array)
    # Assuming the model outputs a probability where >= 0.5 means "Malignant"
    if prediction[0][0] >= 0.5:
        label = 'Malignant'
        confidence = prediction[0][0] * 100
    else:
        label = 'Benign'
        confidence = (1 - prediction[0][0]) * 100
     # Converting confidence to a native Python float
    return label, float (round(confidence, 2))
