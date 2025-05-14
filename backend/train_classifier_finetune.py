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