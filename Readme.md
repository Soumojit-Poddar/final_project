# Start all services

Terminal 1: Backend
cd backend
npm run dev

Terminal 2: ML Service
cd ml-service
venv\Scripts\activate
python run.py

Terminal 3: Frontend
cd frontend
npm run dev


# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate


express: Web framework for building APIs
mongoose: MongoDB object modeling
dotenv: Environment variables management
bcryptjs: Password hashing
jsonwebtoken: JWT authentication
cors: Allow cross-origin requests (frontend ↔ backend)
multer: File upload handling (PDFs)
axios: Make HTTP requests to ML service
nodemon: Auto-restart server on code changes


Flask: Web framework for building APIs
Flask-CORS: Handle cross-origin requests
python-dotenv: Environment variables
PyPDF2 & pdfplumber: PDF text extraction
spacy: Natural Language Processing (skill extraction)
scikit-learn: TF-IDF and similarity calculations
sentence-transformers: Advanced semantic similarity
numpy & pandas: Data manipulation
gunicorn: Production server