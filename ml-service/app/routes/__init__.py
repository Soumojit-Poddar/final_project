from flask import Blueprint, request, jsonify
import os
import sys

# Add parent directory to path to import utilities
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.pdf_parser import PDFParser
from utils.skill_extractor import SkillExtractor
from utils.resume_matcher import ResumeMatcher
from werkzeug.utils import secure_filename

print("🔧 Initializing ML routes...")

# Create blueprint
ml_bp = Blueprint('ml', __name__)

# Initialize utilities
print("📦 Loading PDF parser...")
pdf_parser = PDFParser()

print("📦 Loading skill extractor...")
skill_extractor = SkillExtractor()

print("📦 Loading resume matcher...")
resume_matcher = ResumeMatcher()

print("✅ ML utilities loaded successfully")

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@ml_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    print("💚 Health check called")
    return jsonify({
        'success': True,
        'message': 'ML Service is running',
        'version': '1.0.0'
    }), 200

@ml_bp.route('/test', methods=['GET'])
def test():
    """Simple test endpoint"""
    print("🧪 Test endpoint called")
    return jsonify({
        'success': True,
        'message': 'Test endpoint working!'
    }), 200

@ml_bp.route('/test-match', methods=['GET', 'POST'])
def test_match():
    """Test matching with hardcoded data"""
    print("🎯 Test match called")
    
    try:
        job_description = "Looking for Python developer with Django and Flask experience"
        resume_text = "Python developer with 5 years experience in Django and Flask"
        job_skills = ["python", "django", "flask"]
        resume_skills = ["python", "django", "flask", "rest"]
        
        print("Calculating match...")
        match_result = resume_matcher.calculate_match_score(
            job_description=job_description,
            resume_text=resume_text,
            job_skills=job_skills,
            resume_skills=resume_skills
        )
        
        print(f"Match calculated: {match_result['match_score']}%")
        
        return jsonify({
            'success': True,
            'message': 'Test successful',
            'data': match_result
        }), 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@ml_bp.route('/match-resume', methods=['POST'])
def match_resume():
    """Calculate match score between resume and job description"""
    print("🎯 Match resume endpoint called")
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        job_description = data.get('job_description', '')
        resume_text = data.get('resume_text', '')
        job_skills = data.get('job_skills', [])
        resume_skills = data.get('resume_skills', [])
        
        print(f"JD: {len(job_description)} chars, Resume: {len(resume_text)} chars")
        
        if not job_description or not resume_text:
            return jsonify({
                'success': False,
                'message': 'job_description and resume_text are required'
            }), 400
        
        # Extract skills if not provided
        if not job_skills:
            job_skills = skill_extractor.extract_skills(job_description)
        
        if not resume_skills:
            resume_skills = skill_extractor.extract_skills(resume_text)
        
        # Calculate match
        match_result = resume_matcher.calculate_match_score(
            job_description=job_description,
            resume_text=resume_text,
            job_skills=job_skills,
            resume_skills=resume_skills
        )
        
        print(f"✅ Match: {match_result['match_score']}%")
        
        return jsonify({
            'success': True,
            'data': match_result
        }), 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@ml_bp.route('/extract-skills', methods=['POST'])
def extract_skills():
    """Extract skills from text"""
    try:
        data = request.get_json()
        
        if 'text' not in data:
            return jsonify({
                'success': False,
                'message': 'text field is required'
            }), 400
        
        skills = skill_extractor.extract_skills(data['text'])
        
        return jsonify({
            'success': True,
            'data': {
                'skills': skills,
                'count': len(skills)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@ml_bp.route('/parse-resume', methods=['POST'])
def parse_resume():
    """Parse PDF resume"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Only PDF files allowed'
            }), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Extract text
        text = pdf_parser.extract_text(filepath)
        
        if not text:
            os.remove(filepath)
            return jsonify({
                'success': False,
                'message': 'Could not extract text'
            }), 400
        
        # Extract data
        name = pdf_parser.extract_name(text)
        email = pdf_parser.extract_email(text)
        phone = pdf_parser.extract_phone(text)
        skills = skill_extractor.extract_skills(text)
        experience_years = skill_extractor.extract_experience_years(text)
        
        # Clean up
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'data': {
                'text': text,
                'parsed': {
                    'name': name,
                    'email': email,
                    'phone': phone,
                    'skills': skills,
                    'experience_years': experience_years
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

print("✅ ML routes defined")