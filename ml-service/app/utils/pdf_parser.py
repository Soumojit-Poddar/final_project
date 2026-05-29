import PyPDF2
import pdfplumber
import re

class PDFParser:
    """Extract text and structured data from PDF resumes"""
    
    @staticmethod
    def extract_text(pdf_path):
        """
        Extract text from PDF using multiple methods for better accuracy
        
        Args:
            pdf_path (str): Path to PDF file
            
        Returns:
            str: Extracted text
        """
        text = ""
        
        try:
            # Method 1: Try pdfplumber (better for complex layouts)
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber failed: {e}")
            
            # Method 2: Fallback to PyPDF2
            try:
                with open(pdf_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            except Exception as e2:
                print(f"PyPDF2 also failed: {e2}")
                return ""
        
        # Clean up text
        text = PDFParser.clean_text(text)
        return text
    
    @staticmethod
    def clean_text(text):
        """Clean extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s@.,\-\+\#\(\)]', '', text)
        return text.strip()
    
    @staticmethod
    def extract_email(text):
        """Extract email address from text"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        return emails[0] if emails else None
    
    @staticmethod
    def extract_phone(text):
        """Extract phone number from text"""
        # Matches various phone formats
        phone_pattern = r'(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        return phones[0] if phones else None
    
    @staticmethod
    def extract_name(text):
        """
        Extract name (simple heuristic - first line or first 2-3 capitalized words)
        This is basic - can be improved with NER
        """
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            # Look for lines with 2-3 capitalized words
            words = line.split()
            if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                return line
        return None