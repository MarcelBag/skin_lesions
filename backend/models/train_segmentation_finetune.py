import os
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 1. Load the existing model
model_path = 'backend/models/skin_segmentation_model.keras'
model = load_model(model_path)

# 2. Unfreeze last two encoder blocks for fine-tuning
for layer in model.layers:
    # assuming naming convention: layers up to “conv2d_?” are encoder; adjust names as needed
    if 'conv2d_transpose' in layer.name or 'conv2d_5' in layer.name or 'conv2d_6' in layer.name:
        layer.trainable = True
    else:
        layer.trainable = False