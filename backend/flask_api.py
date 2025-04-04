from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from models.model import predict  # Import the predict function from model.py

app = Flask(__name__)
CORS(app)

# Define the upload folder and allowed file types
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Utility function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'message': 'No image part'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(image_path)

        # Read the image file as binary data
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Call the model's prediction function
        predicted_label, confidence = predict(image_data)

        return jsonify({
            'prediction': predicted_label,
            'confidence': confidence
        })

    return jsonify({'message': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
