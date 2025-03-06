from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import logging
import traceback
import json

# Model-specific imports with try/except to handle missing packages
try:
    import joblib
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    import librosa
    from PIL import Image
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Please install required packages: pip install joblib tensorflow librosa pillow")

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define the upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Model paths - adjust these to where your models are stored
TEXT_MODEL_PATH = "text_pipeline.pkl"
AUDIO_MODEL_PATH = "resnet50.h5"
IMAGE_MODEL_PATH = "images_model.h5"

# Initialize models as None, will be loaded on demand
text_model = None
audio_model = None
image_model = None

def load_models():
    """Load models if they exist, otherwise return appropriate error message."""
    global text_model, audio_model, image_model
    models_status = {"text": True, "audio": True, "image": True}
    
    # Load text model
    if os.path.exists(TEXT_MODEL_PATH):
        try:
            text_model = joblib.load(TEXT_MODEL_PATH)
            logger.info("Text model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading text model: {e}")
            models_status["text"] = False
    else:
        logger.warning(f"Text model not found at {TEXT_MODEL_PATH}")
        models_status["text"] = False
    
    # Load audio model
    if os.path.exists(AUDIO_MODEL_PATH):
        try:
            audio_model = load_model(AUDIO_MODEL_PATH)
            logger.info("Audio model loaded successfully")
            # Print model summary for debugging
            logger.info(f"Audio model input shape: {audio_model.input_shape}")
            logger.info(f"Audio model output shape: {audio_model.output_shape}")
        except Exception as e:
            logger.error(f"Error loading audio model: {e}")
            models_status["audio"] = False
    else:
        logger.warning(f"Audio model not found at {AUDIO_MODEL_PATH}")
        models_status["audio"] = False
        
    # Load image model
    if os.path.exists(IMAGE_MODEL_PATH):
        try:
            image_model = load_model(IMAGE_MODEL_PATH)
            logger.info("Image model loaded successfully")
            # Print model summary for debugging
            logger.info(f"Image model input shape: {image_model.input_shape}")
            logger.info(f"Image model output shape: {image_model.output_shape}")
        except Exception as e:
            logger.error(f"Error loading image model: {e}")
            models_status["image"] = False
    else:
        logger.warning(f"Image model not found at {IMAGE_MODEL_PATH}")
        models_status["image"] = False
    
    return models_status

@app.route("/status", methods=["GET"])
def status():
    """Endpoint to check service status and which models are available."""
    models_status = load_models()
    return jsonify({
        "status": "online",
        "models": models_status
    })

@app.route("/analyze", methods=["POST"])
def analyze_content():
    """Main endpoint to analyze content for AI detection."""
    # Log all incoming data for debugging
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request files: {request.files.keys() if request.files else 'No files'}")
    logger.info(f"Request form: {request.form.keys() if request.form else 'No form data'}")
    
    if not request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files.get("file")
    file_type = request.form.get("type")  # 'text', 'audio', 'image'
    
    logger.info(f"File received: {file.filename if file else 'None'}")
    logger.info(f"File type: {file_type}")

    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    if file_type not in ["text", "audio", "image"]:
        return jsonify({"error": "Invalid file type. Must be 'text', 'audio', or 'image'"}), 400

    # Save the file
    try:
        filename = os.path.basename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        logger.info(f"File saved to: {file_path}")
        
        # Check if file is saved and log file size
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            logger.info(f"File saved successfully. Size: {file_size} bytes")
        else:
            return jsonify({"error": "File not saved properly"}), 500
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        return jsonify({"error": f"Error saving file: {str(e)}"}), 500
    
    # Load models if not already loaded
    load_models()
    
    # Process file based on type
    try:
        if file_type == "text":
            if text_model is None:
                return jsonify({"error": "Text model not available"}), 503
            result = analyze_text(file_path)
        elif file_type == "audio":
            if audio_model is None:
                return jsonify({"error": "Audio model not available"}), 503
            result = analyze_audio(file_path)
        elif file_type == "image":
            if image_model is None:
                return jsonify({"error": "Image model not available"}), 503
            result = analyze_image(file_path)
        
        # Log the result for debugging
        logger.info(f"Analysis result: {result.get_data(as_text=True)}")
        
        # Clean up - remove uploaded file after processing
        try:
            os.remove(file_path)
            logger.info(f"Temporary file {file_path} removed")
        except Exception as e:
            logger.warning(f"Could not remove temporary file {file_path}: {e}")
        
        return result
    except Exception as e:
        logger.error(f"Error processing {file_type}: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": f"Error processing {file_type}",
            "details": str(e)
        }), 500

def analyze_text(file_path):
    """Analyze text file for AI detection."""
    logger.info("Starting text analysis")
    
    try:
        # Read the text file
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        
        logger.info(f"Text length: {len(text)} characters")
        
        # Direct prediction using text model (assuming it's a pipeline with preprocessing)
        try:
            # Method 1: Try using predict_proba
            if hasattr(text_model, "predict_proba"):
                logger.info("Using predict_proba method")
                # For scikit-learn text classification pipelines
                probabilities = text_model.predict_proba([text])[0]
                logger.info(f"Prediction probabilities: {probabilities}")
                
                # Check the order of classes in the model
                if hasattr(text_model, "classes_"):
                    logger.info(f"Model classes: {text_model.classes_}")
                    
                # Assuming 1/True is AI-generated, 0/False is human-generated
                # Adjust based on your model's class ordering
                ai_index = 1 if len(probabilities) > 1 else 0
                human_index = 0
                
                ai_confidence = float(probabilities[ai_index] * 100)
                human_confidence = float(probabilities[human_index] * 100)
            else:
                # Method 2: Use predict and assign confidence
                logger.info("Using predict method")
                prediction = text_model.predict([text])[0]
                logger.info(f"Prediction result: {prediction}")
                
                # Convert prediction to boolean or numeric
                if isinstance(prediction, (str, bool)):
                    is_ai = prediction in [True, "ai", "AI", "generated", "fake", 1, "1"]
                else:
                    is_ai = int(prediction) == 1
                
                ai_confidence = 95.0 if is_ai else 5.0
                human_confidence = 5.0 if is_ai else 95.0
                
            logger.info(f"AI confidence: {ai_confidence}, Human confidence: {human_confidence}")
                
        except Exception as e:
            logger.error(f"Primary text prediction method failed: {e}")
            logger.error(traceback.format_exc())
            
            # Fallback method: direct prediction
            logger.info("Using fallback prediction method")
            prediction = text_model.predict([text])
            is_ai = bool(prediction[0] == 1 or prediction[0] == True or prediction[0] == "ai")
            
            ai_confidence = 95.0 if is_ai else 5.0
            human_confidence = 5.0 if is_ai else 95.0
            
            logger.info(f"Fallback prediction: {prediction}, is_ai: {is_ai}")
            logger.info(f"AI confidence: {ai_confidence}, Human confidence: {human_confidence}")
    
    except Exception as e:
        logger.error(f"Text analysis failed: {e}")
        logger.error(traceback.format_exc())
        raise ValueError(f"Text analysis failed: {str(e)}")

    # Create response
    response = {
        "isGenerated": ai_confidence > human_confidence,
        "confidence": max(ai_confidence, human_confidence),
        "aiConfidence": ai_confidence,
        "humanConfidence": human_confidence
    }
    
    logger.info(f"Text analysis response: {response}")
    return jsonify(response)

def analyze_audio(file_path):
    """Analyze audio file for AI detection."""
    logger.info("Starting audio analysis")
    
    try:
        # Load and preprocess audio
        logger.info(f"Loading audio file: {file_path}")
        audio, sr = librosa.load(file_path, sr=22050)  # Fixed sample rate for consistency
        logger.info(f"Audio loaded. Duration: {len(audio)/sr:.2f}s, Sample rate: {sr}Hz")
        
        # Make sure we have enough audio data
        if len(audio) < sr:  # Less than 1 second
            logger.warning("Audio file too short, padding with zeros")
            audio = np.pad(audio, (0, sr - len(audio)))
        
        # Extract MFCC features
        logger.info("Extracting MFCC features")
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40)
        logger.info(f"MFCC shape: {mfccs.shape}")
        
        # Get model input shape requirements
        input_shape = audio_model.input_shape
        logger.info(f"Model input shape: {input_shape}")
        
        # Process features based on model requirements
        if len(input_shape) == 4:  # CNN model expecting (batch, height, width, channels)
            logger.info("Preparing features for 2D CNN model")
            # For 2D CNN, we need a 2D representation (like a spectrogram)
            features = mfccs
            features = np.expand_dims(features, axis=0)  # Add batch dimension
            features = np.expand_dims(features, axis=-1)  # Add channel dimension
            logger.info(f"Processed features shape: {features.shape}")
            
        elif len(input_shape) == 3:  # 1D CNN or RNN model expecting (batch, time, features)
            logger.info("Preparing features for 1D CNN/RNN model")
            features = mfccs.T  # Transpose to get (time_steps, features)
            features = np.expand_dims(features, axis=0)  # Add batch dimension
            logger.info(f"Processed features shape: {features.shape}")
            
        else:
            # For other model types, try a simpler approach
            logger.info("Preparing features using standard approach")
            features = np.mean(mfccs.T, axis=0)  # Get mean of each MFCC coefficient
            features = np.expand_dims(features, axis=0)  # Add batch dimension
            
            # Reshape if needed to match model input
            target_shape = [s for s in input_shape if s is not None]
            if len(target_shape) > 1:
                # Try to reshape to the target shape
                target_size = np.prod(target_shape[1:])
                if len(features.flatten()) != target_size:
                    # Pad or truncate to match the expected size
                    flat_features = features.flatten()
                    if len(flat_features) < target_size:
                        flat_features = np.pad(flat_features, (0, target_size - len(flat_features)))
                    else:
                        flat_features = flat_features[:target_size]
                    features = flat_features.reshape(target_shape)
            
            logger.info(f"Final features shape: {features.shape}")
        
        # Make prediction
        logger.info("Making prediction")
        prediction = audio_model.predict(features)
        logger.info(f"Raw prediction: {prediction}")
        
        # Process prediction results
        if isinstance(prediction, list):
            prediction = prediction[0]
            
        logger.info(f"Prediction shape: {prediction.shape}")
        
        # Handle different output formats
        if len(prediction.shape) > 1 and prediction.shape[-1] > 1:
            # Multi-class output - determine which index corresponds to AI-generated
            ai_index = 1  # Assuming index 1 is AI-generated, 0 is human
            ai_confidence = float(prediction[0][ai_index]) * 100
            human_confidence = float(prediction[0][1-ai_index]) * 100
        else:
            # Binary output - assuming values close to 1 mean AI-generated
            pred_value = float(prediction[0][0])
            ai_confidence = pred_value * 100
            human_confidence = (1 - pred_value) * 100
            
        logger.info(f"AI confidence: {ai_confidence}, Human confidence: {human_confidence}")
            
    except Exception as e:
        logger.error(f"Audio analysis failed: {e}")
        logger.error(traceback.format_exc())
        
        # If analysis fails completely, return a fallback result
        ai_confidence = 50.0
        human_confidence = 50.0
        logger.warning("Using fallback audio analysis result")

    # Create response
    response = {
        "isGenerated": ai_confidence > human_confidence,
        "confidence": max(ai_confidence, human_confidence),
        "aiConfidence": ai_confidence,
        "humanConfidence": human_confidence
    }
    
    logger.info(f"Audio analysis response: {response}")
    return jsonify(response)

def analyze_image(file_path):
    """Analyze image file for AI detection."""
    logger.info("Starting image analysis")
    
    try:
        # Open and preprocess image
        logger.info(f"Loading image file: {file_path}")
        img = Image.open(file_path)
        logger.info(f"Image loaded. Size: {img.size}, Mode: {img.mode}")
        
        # Check if image is in RGB mode, convert if not
        if img.mode != "RGB":
            logger.info("Converting image to RGB")
            img = img.convert("RGB")
        
        # Get the expected input shape from the model
        input_shape = image_model.input_shape
        expected_size = (input_shape[1], input_shape[2]) if len(input_shape) == 4 else (256, 256)
        logger.info(f"Resizing image to {expected_size}")
        
        # Resize to expected dimensions
        img = img.resize(expected_size)
        
        # Convert to numpy array and normalize
        img_array = np.array(img) / 255.0
        logger.info(f"Image array shape: {img_array.shape}")
        
        # Add batch dimension if needed
        if len(img_array.shape) == 3:  # height, width, channels
            img_array = np.expand_dims(img_array, axis=0)
            
        logger.info(f"Preprocessed image shape: {img_array.shape}")
        
        # Make prediction
        logger.info("Making prediction")
        prediction = image_model.predict(img_array)
        logger.info(f"Raw prediction: {prediction}")
        
        # Process prediction results
        if isinstance(prediction, list):
            prediction = prediction[0]
            
        logger.info(f"Prediction shape: {prediction.shape}")
        
        # Handle different output formats
        if len(prediction.shape) > 1 and prediction.shape[-1] > 1:
            # Multi-class output where classes are [real, fake]
            fake_index = 1  # Assuming index 1 is fake/AI-generated
            fake_confidence = float(prediction[0][fake_index]) * 100
            real_confidence = float(prediction[0][1-fake_index]) * 100
        else:
            # Binary output where value close to 1 means fake/AI-generated
            # IMPORTANT: We're flipping the interpretation here to match your expectations
            # Assuming your model outputs values close to 1 for real images
            pred_value = float(prediction[0][0])
            real_confidence = pred_value * 100
            fake_confidence = (1 - pred_value) * 100
            
        logger.info(f"AI confidence: {fake_confidence}, Human confidence: {real_confidence}")
            
    except Exception as e:
        logger.error(f"Image analysis failed: {e}")
        logger.error(traceback.format_exc())
        raise ValueError(f"Image analysis failed: {str(e)}")

    # Create response
    response = {
        "isGenerated": fake_confidence > real_confidence,
        "confidence": max(fake_confidence, real_confidence),
        "aiConfidence": fake_confidence,
        "humanConfidence": real_confidence
    }
    
    logger.info(f"Image analysis response: {response}")
    return jsonify(response)

@app.route("/test", methods=["GET"])
def test():
    """Simple endpoint to test if the API is working."""
    return jsonify({"status": "API is working!"})

if __name__ == "__main__":
    # Try to load models at startup
    load_models()
    
    # Run the Flask app
    app.run(host="0.0.0.0", port=5000, debug=True)