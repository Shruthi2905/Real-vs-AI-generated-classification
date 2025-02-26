from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import librosa
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import cv2

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Define the upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load pre-trained models
text_model = joblib.load("text_pipeline.pkl")  # Text model (.pkl format)
audio_model = load_model("resnet50.h5")  # Audio model (.h5 format)
image_model = load_model("images_model.h5")  # Image model (.h5 format)

# Load tokenizer if required for text preprocessing
TOKENIZER_PATH = "models/tokenizer.pkl"
tokenizer = joblib.load(TOKENIZER_PATH) if os.path.exists(TOKENIZER_PATH) else None

@app.route("/analyze", methods=["POST"])
def analyze_content():
    if not request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files.get("file")
    file_type = request.form.get("type")  # 'text', 'audio', 'image'

    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Debugging: Check if file is saved
    if not os.path.exists(file_path):
        return jsonify({"error": "File not saved properly"}), 500

    # Process file based on type
    if file_type == "text":
        return analyze_text(file_path)
    elif file_type == "audio":
        return analyze_audio(file_path)
    elif file_type == "image":
        return analyze_image(file_path)
    else:
        return jsonify({"error": "Invalid file type"}), 400

def preprocess_text(file_path):
    """Reads and preprocesses text data."""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    if tokenizer:
        sequences = tokenizer.texts_to_sequences([text])
        padded_sequences = pad_sequences(sequences, maxlen=500)  # Adjust maxlen if needed
        return padded_sequences
    else:
        return [text]  # If using a traditional ML model like SVM, RandomForest, etc.

def analyze_text(file_path):
    """Predicts if the text is AI-generated or real after preprocessing."""
    preprocessed_text = preprocess_text(file_path)
    prediction = text_model.predict(preprocessed_text)[0]
    return jsonify({"result": "AI-generated" if  prediction==1 else "Real"})

def preprocess_audio(file_path):
    """Extracts MFCC features from an audio file."""
    audio, sr = librosa.load(file_path, sr=None)
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
    features = np.mean(mfccs.T, axis=0)
    return features.reshape(1, -1, 1)  # Reshape if needed

def analyze_audio(file_path):
    """Predicts if the audio is AI-generated or real after preprocessing."""
    preprocessed_audio = preprocess_audio(file_path)
    prediction = audio_model.predict(preprocessed_audio)[0][0]
    return jsonify({"result": "AI-generated" if prediction ==1 else "Real"})

def preprocess_image(file_path):
    """Loads and preprocesses an image."""
    img = load_img(file_path, target_size=(256,256))  # Resize image
    img_array = img_to_array(img) / 255.0  # Normalize pixel values
    return np.expand_dims(img_array, axis=0)

def analyze_image(file_path):
    """Predicts if the image is AI-generated or real after preprocessing."""
    preprocessed_image = preprocess_image(file_path)
    prediction = image_model.predict(preprocessed_image)[0][0]
    return jsonify({"result": "AI-generated" if prediction ==1 else "Real"})

if __name__ == "__main__":
    app.run(debug=True)
