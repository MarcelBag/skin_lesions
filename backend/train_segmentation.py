from tensorflow.keras.layers import Conv2D, Conv2DTranspose, MaxPooling2D, concatenate, Input
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import os

def build_unet(input_shape=(224,224,3)):
    inputs = Input(input_shape)
    # down
    c1 = Conv2D(16,3,activation='relu',padding='same')(inputs)
    c1 = Conv2D(16,3,activation='relu',padding='same')(c1)
    p1 = MaxPooling2D()(c1)
    c2 = Conv2D(32,3,activation='relu',padding='same')(p1)
    c2 = Conv2D(32,3,activation='relu',padding='same')(c2)
    p2 = MaxPooling2D()(c2)
    # bottleneck
    c3 = Conv2D(64,3,activation='relu',padding='same')(p2)
    c3 = Conv2D(64,3,activation='relu',padding='same')(c3)
    # up
    u4 = Conv2DTranspose(32,2,strides=2,padding='same')(c3)
    u4 = concatenate([u4, c2])
    c4 = Conv2D(32,3,activation='relu',padding='same')(u4)
    c4 = Conv2D(32,3,activation='relu',padding='same')(c4)
    u5 = Conv2DTranspose(16,2,strides=2,padding='same')(c4)
    u5 = concatenate([u5, c1])
    c5 = Conv2D(16,3,activation='relu',padding='same')(u5)
    c5 = Conv2D(16,3,activation='relu',padding='same')(c5)
    outputs = Conv2D(1,1,activation='sigmoid')(c5)
    return Model(inputs, outputs)

# Then compile, fit with your image+mask generators, and save:
model = build_unet()
model.compile(optimizer=Adam(1e-4), loss='binary_crossentropy', metrics=['accuracy'])
# ... fit with data generators ...
model.save('backend/models/skin_segmentation_model.keras')
