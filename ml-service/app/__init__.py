from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    """Application factory pattern"""
    
    # Load environment variables
    load_dotenv()
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Configuration
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 5242880))
    
    # Enable CORS
    CORS(app)
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes.ml_routes import ml_bp
    app.register_blueprint(ml_bp, url_prefix='/api')
    
    return app