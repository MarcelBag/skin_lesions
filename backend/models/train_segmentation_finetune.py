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

# 3. Compile with a lower learning rate
model.compile(
    optimizer=Adam(learning_rate=1e-5),
    loss='binary_crossentropy',
    metrics=['accuracy']
)
# 4. Data generators (same as before)
data_dir = 'data_segmentation'  # folder with /images and /masks subfolders
img_size = (224,224)
batch_size = 8

"""""
img_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    validation_split=0.2
)
mask_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)
train_img_gen = img_datagen.flow_from_directory(
    data_dir,
    classes=['images'],
    target_size=img_size,
    batch_size=batch_size,
    class_mode=None,
    seed=42,
    subset='training'
)
"""
img_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    validation_split=0.2
)

mask_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    validation_split=0.2
)
