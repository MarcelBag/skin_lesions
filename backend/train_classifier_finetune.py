import os
import numpy as np
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau, EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 1. Build base model
base = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(224,224,3))
x = GlobalAveragePooling2D()(base.output)

x = Dropout(0.3)(x)
preds = Dense(1, activation='sigmoid')(x)
model = Model(inputs=base.input, outputs=preds)

# 2. Freeze all layers initially
for layer in base.layers:
    layer.trainable = False
model.compile(optimizer=Adam(1e-3), loss='binary_crossentropy', metrics=['accuracy'])

# 3. Data generators load from cropped directories
# Assume you have pre-cropped and saved lesion images into data_classifier/skin and /nonskin
data_dir = 'data_classifier'
img_size = (224,224)
batch_size = 16

datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    validation_split=0.2
)

train_gen = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='binary',
    subset='training'
)

val_gen = datagen.flow_from_directory(
    data_dir,
    target_size=img_size,
    batch_size=batch_size,
    class_mode='binary',
    subset='validation'
)
callbacks = [
    ModelCheckpoint('backend/models/skin_classifier.keras', save_best_only=True, monitor='val_loss'),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6),
    EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True)
]

# 4. Train head only
model.fit(train_gen, validation_data=val_gen, epochs=10, callbacks=callbacks)

# 5. Unfreeze top layers and continue fine-tuning
for layer in base.layers[-20:]:
    layer.trainable = True

model.compile(optimizer=Adam(1e-5), loss='binary_crossentropy', metrics=['accuracy'])
