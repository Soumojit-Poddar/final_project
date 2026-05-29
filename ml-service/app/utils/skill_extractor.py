import re
from typing import List

class SkillExtractor:
    """Extract skills from text using pattern matching (NO NLP/spacy)"""
    
    def __init__(self):
        # Comprehensive skill database
        self.known_skills = {
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 
            'php', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl',
            
            # Web Technologies
            'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
            'django', 'flask', 'fastapi', 'spring', 'asp.net', 'laravel', 'rails',
            'next.js', 'nuxt.js',
            
            # Databases
            'mongodb', 'mysql', 'postgresql', 'oracle', 'sql server', 'redis',
            'cassandra', 'dynamodb', 'elasticsearch', 'sql', 'nosql', 'sqlite',
            'firebase', 'mariadb',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins',
            'gitlab', 'github', 'terraform', 'ansible', 'ci/cd', 'devops', 
            'microservices', 'linux', 'unix', 'windows server',
            
            # Data Science & ML
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 
            'scikit-learn', 'pandas', 'numpy', 'data analysis', 'statistics',
            'nlp', 'computer vision', 'neural networks', 'keras',
            
            # Mobile
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
            
            # Tools & Others
            'git', 'agile', 'scrum', 'jira', 'api', 'rest api', 'graphql',
            'testing', 'junit', 'selenium', 'jest', 'cypress', 'postman',
            'webpack', 'babel', 'npm', 'yarn', 'maven', 'gradle',
            
            # Soft Skills (optional but useful)
            'leadership', 'communication', 'teamwork', 'problem solving',
            'project management', 'analytical thinking', 'critical thinking'
        }
    
    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills from text using ONLY pattern matching (NO spacy/NLP)
        
        Methods:
        1. Direct matching with known skills database
        2. Regex pattern matching for skill mentions
        3. Case-insensitive word boundary matching
        
        Args:
            text (str): Input text (resume or job description)
            
        Returns:
            List[str]: Sorted list of extracted skills
        """
        if not text:
            return []
        
        text_lower = text.lower()
        found_skills = set()
        
        # Method 1: Direct matching with known skills database
        # Using word boundaries to avoid partial matches
        for skill in self.known_skills:
            # Create pattern with word boundaries
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(skill)
        
        # Method 2: Pattern matching for common skill mention formats
        # Catches: "experience with X", "proficient in Y", "skilled in Z"
        patterns = [
            r'experience\s+(?:with|in)\s+([\w\s\.\+\#]+?)(?:\,|\.|;|and)',
            r'proficient\s+(?:with|in)\s+([\w\s\.\+\#]+?)(?:\,|\.|;|and)',
            r'skilled\s+(?:with|in)\s+([\w\s\.\+\#]+?)(?:\,|\.|;|and)',
            r'knowledge\s+of\s+([\w\s\.\+\#]+?)(?:\,|\.|;|and)',
            r'expertise\s+(?:in|with)\s+([\w\s\.\+\#]+?)(?:\,|\.|;|and)',
            r'working\s+(?:with|knowledge\s+of)\s+([\w\s\.\+\#]+?)(?:\,|\.|;|and)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                # Clean up the matched skill
                skill = match.strip().lower()
                # Only add if it's in known skills
                if skill in self.known_skills:
                    found_skills.add(skill)
        
        # Return sorted, deduplicated list
        return sorted(list(found_skills))
    
    def extract_experience_years(self, text: str) -> int:
        """
        Extract years of experience from text using regex patterns
        
        Patterns:
        - "5 years of experience"
        - "5+ years"
        - "experience: 5 years"
        
        Args:
            text (str): Text to search
            
        Returns:
            int: Years of experience (0 if not found)
        """
        if not text:
            return 0
        
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of)?\s*experience',
            r'experience[:\s]+(?:of\s+)?(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*(?:in|of)\s*(?:software|development|engineering|programming)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    return int(match.group(1))
                except (ValueError, IndexError):
                    continue
        
        return 0

# import spacy
# import re
# from typing import List, Set

# class SkillExtractor:
#     """Extract skills from text using NLP and pattern matching"""
    
#     def __init__(self):
#         # Load spaCy model
#         try:
#             self.nlp = spacy.load("en_core_web_sm")
#         except:
#             print("Downloading spaCy model...")
#             import os
#             os.system("python -m spacy download en_core_web_sm")
#             self.nlp = spacy.load("en_core_web_sm")
        
#         # Comprehensive skill database
#         self.known_skills = {
#             # Programming Languages
#             'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 
#             'php', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab',
            
#             # Web Technologies
#             'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
#             'django', 'flask', 'fastapi', 'spring', 'asp.net', 'laravel',
            
#             # Databases
#             'mongodb', 'mysql', 'postgresql', 'oracle', 'sql server', 'redis',
#             'cassandra', 'dynamodb', 'elasticsearch', 'sql', 'nosql',
            
#             # Cloud & DevOps
#             'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab',
#             'terraform', 'ansible', 'ci/cd', 'devops', 'microservices',
            
#             # Data Science & ML
#             'machine learning', 'deep learning', 'tensorflow', 'pytorch', 
#             'scikit-learn', 'pandas', 'numpy', 'data analysis', 'statistics',
#             'nlp', 'computer vision', 'neural networks',
            
#             # Mobile
#             'android', 'ios', 'react native', 'flutter', 'xamarin',
            
#             # Tools & Others
#             'git', 'linux', 'agile', 'scrum', 'jira', 'api', 'rest', 'graphql',
#             'testing', 'junit', 'selenium', 'jest', 'cypress',
            
#             # Soft Skills
#             'leadership', 'communication', 'teamwork', 'problem solving',
#             'project management', 'analytical thinking'
#         }
    
#     def extract_skills(self, text: str) -> List[str]:
#         """
#         Extract skills from text using multiple methods
        
#         Args:
#             text (str): Input text (resume or job description)
            
#         Returns:
#             List[str]: List of extracted skills
#         """
#         text_lower = text.lower()
#         found_skills = set()
        
#         # Method 1: Direct matching with known skills
#         for skill in self.known_skills:
#             if skill in text_lower:
#                 found_skills.add(skill)
        
#         # Method 2: Extract noun chunks (potential skills)
#         doc = self.nlp(text)
#         for chunk in doc.noun_chunks:
#             chunk_text = chunk.text.lower().strip()
#             # Check if it looks like a skill (2-3 words max)
#             if len(chunk_text.split()) <= 3:
#                 # Check if it's in known skills or looks technical
#                 if chunk_text in self.known_skills or self._is_technical_term(chunk_text):
#                     found_skills.add(chunk_text)
        
#         # Method 3: Pattern matching for common skill formats
#         # e.g., "experience with X", "proficient in Y"
#         patterns = [
#             r'experience (?:with|in) ([\w\s\.\+\#]+?)(?:\,|\.|\n)',
#             r'proficient in ([\w\s\.\+\#]+?)(?:\,|\.|\n)',
#             r'skilled in ([\w\s\.\+\#]+?)(?:\,|\.|\n)',
#             r'knowledge of ([\w\s\.\+\#]+?)(?:\,|\.|\n)',
#         ]
        
#         for pattern in patterns:
#             matches = re.findall(pattern, text_lower)
#             for match in matches:
#                 skill = match.strip()
#                 if skill in self.known_skills:
#                     found_skills.add(skill)
        
#         return sorted(list(found_skills))
    
#     def _is_technical_term(self, term: str) -> bool:
#         """Check if a term looks like a technical skill"""
#         # Contains version numbers, dots, or plus signs (e.g., "node.js", "c++")
#         if re.search(r'[\d\.\+\#]', term):
#             return True
        
#         # All caps acronyms (e.g., "API", "SQL")
#         if term.isupper() and len(term) >= 2:
#             return True
        
#         # Contains technical keywords
#         technical_keywords = ['server', 'framework', 'library', 'platform', 'stack']
#         if any(keyword in term for keyword in technical_keywords):
#             return True
        
#         return False
    
#     def extract_experience_years(self, text: str) -> int:
#         """
#         Extract years of experience from text
        
#         Returns:
#             int: Years of experience (0 if not found)
#         """
#         patterns = [
#             r'(\d+)\+?\s*years?\s*(?:of)?\s*experience',
#             r'experience\s*(?:of)?\s*(\d+)\+?\s*years?',
#         ]
        
#         for pattern in patterns:
#             match = re.search(pattern, text.lower())
#             if match:
#                 return int(match.group(1))
        
#         return 0