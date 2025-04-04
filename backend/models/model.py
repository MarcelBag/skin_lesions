import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io

# Load the saved model
model = load_model('backend/models/skin_lesion_model.h5')  # Ensure the path is correct

def predict(image_data):
    try:
        # Convert image to the format required by your model
        img = Image.open(io.BytesIO(image_data))
        img = img.resize((224, 224))  # Resize to the model's expected input size
        img_array = np.array(img)

        # Normalize the image if needed (example for normalization)
        img_array = img_array / 255.0  # Normalize the pixel values to [0, 1]

        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

        # Perform prediction
        prediction = model.predict(img_array)

        # Assuming binary classification, we'll get the probability
        # You can adjust this for multi-class classification
        predicted_class = np.argmax(prediction, axis=1)[0]  # Get the predicted class (0 or 1 for binary)
        confidence = 100 * np.max(prediction)  # Get the confidence of the prediction

        # If you have more than 2 classes, you may want to map the predicted class back to a label
        class_names = ["Benign", "Malignant"]  # Modify according to your model
        predicted_label = class_names[predicted_class]

        return predicted_label, confidence

    except Exception as e:
        print(f"Error during prediction: {e}")
        return "Error", 0
