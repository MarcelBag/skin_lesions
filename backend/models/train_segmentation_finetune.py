import os
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 1. Load the existing model
model_path = 'backend/models/skin_segmentation_model.keras'
model = load_model(model_path)