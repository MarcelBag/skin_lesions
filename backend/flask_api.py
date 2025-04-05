from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import os
from werkzeug.utils import secure_filename
from models.model import predict  # Import the predict function from model.py

app = Flask(__name__)

# For development, allow all origins
CORS(app)

@app.route('/predict', methods=['POST'])
def predict_image():
    # For demo purposes, we return static prediction values.
    # In your real code, you would load the image and call predict() here.
    return jsonify({'prediction': 'Malignant', 'confidence': 85.0, 'analysisType': 'Malignant'})

# Define the upload folder and allowed file types
UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
        
        # For demo purposes, we simply return a static prediction.
        # You can integrate your model prediction here (for example, call predict(image_data))
        return jsonify({
            'prediction': 'Malignant',
            'confidence': 85.0,
            'analysisType': request.form.get('analysis-type', 'Unknown')
        })
    
    return jsonify({'message': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
