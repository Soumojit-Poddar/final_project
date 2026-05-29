from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from app.utils.pdf_parser import PDFParser
from app.utils.skill_extractor import SkillExtractor
from app.utils.resume_matcher import ResumeMatcher

ml_bp = Blueprint('ml', __name__)

# Initialize utilities
pdf_parser = PDFParser()
skill_extractor = SkillExtractor()
resume_matcher = ResumeMatcher()

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@ml_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'ML Service is running',
        'version': '1.0.0'
    }), 200

@ml_bp.route('/parse-resume', methods=['POST'])
def parse_resume():
    """
    Parse PDF resume and extract structured data
    
    Expects: multipart/form-data with 'file' field
    Returns: Extracted text and parsed data
    """
    try:
        # Check if file is present
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
                'message': 'Only PDF files are allowed'
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Extract text from PDF
        text = pdf_parser.extract_text(filepath)
        
        if not text:
            os.remove(filepath)  # Clean up
            return jsonify({
                'success': False,
                'message': 'Could not extract text from PDF'
            }), 400
        
        # Extract structured data
        name = pdf_parser.extract_name(text)
        email = pdf_parser.extract_email(text)
        phone = pdf_parser.extract_phone(text)
        skills = skill_extractor.extract_skills(text)
        experience_years = skill_extractor.extract_experience_years(text)
        
        # Clean up uploaded file
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

@ml_bp.route('/match-resume', methods=['POST'])
def match_resume():
    """
    Calculate match score between resume and job description
    
    Expects JSON:
    {
        "job_description": "...",
        "resume_text": "...",
        "job_skills": ["skill1", "skill2"],
        "resume_skills": ["skill1", "skill3"]
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['job_description', 'resume_text']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        job_description = data['job_description']
        resume_text = data['resume_text']
        job_skills = data.get('job_skills', [])
        resume_skills = data.get('resume_skills', [])
        
        # If skills not provided, extract them
        if not job_skills:
            job_skills = skill_extractor.extract_skills(job_description)
        
        if not resume_skills:
            resume_skills = skill_extractor.extract_skills(resume_text)
        
        # Calculate match score
        match_result = resume_matcher.calculate_match_score(
            job_description=job_description,
            resume_text=resume_text,
            job_skills=job_skills,
            resume_skills=resume_skills
        )
        
        return jsonify({
            'success': True,
            'data': match_result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@ml_bp.route('/extract-skills', methods=['POST'])
def extract_skills():
    """
    Extract skills from text
    
    Expects JSON: { "text": "..." }
    """
    try:
        data = request.get_json()
        
        if 'text' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required field: text'
            }), 400
        
        text = data['text']
        skills = skill_extractor.extract_skills(text)
        
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