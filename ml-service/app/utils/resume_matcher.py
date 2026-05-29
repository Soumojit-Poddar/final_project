from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import Dict, List
import re

class ResumeMatcher:
    """Calculate similarity between resume and job description"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1  # Important: Allow single document terms
        )
    
    def calculate_match_score(
        self,
        job_description: str,
        resume_text: str,
        job_skills: List[str],
        resume_skills: List[str]
    ) -> Dict:
        """
        Calculate comprehensive match score between JD and resume
        """
        
        print(f"Debug - JD length: {len(job_description)}")
        print(f"Debug - Resume length: {len(resume_text)}")
        print(f"Debug - Job skills: {job_skills}")
        print(f"Debug - Resume skills: {resume_skills}")
        
        # 1. Text Similarity Score (using TF-IDF + Cosine Similarity)
        similarity_score = 0.0
        try:
            if len(job_description) > 10 and len(resume_text) > 10:
                # Clean and prepare texts
                jd_clean = self._clean_text(job_description)
                resume_clean = self._clean_text(resume_text)
                
                # Create TF-IDF matrix
                tfidf_matrix = self.vectorizer.fit_transform([jd_clean, resume_clean])
                
                # Calculate cosine similarity
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                similarity_score = float(similarity)
                print(f"Debug - Similarity score: {similarity_score}")
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            similarity_score = 0.0
        
        # 2. Skill Matching Score
        job_skills_set = set(s.lower().strip() for s in job_skills if s)
        resume_skills_set = set(s.lower().strip() for s in resume_skills if s)
        
        print(f"Debug - Job skills set: {job_skills_set}")
        print(f"Debug - Resume skills set: {resume_skills_set}")
        
        matched_skills = list(job_skills_set.intersection(resume_skills_set))
        missing_skills = list(job_skills_set - resume_skills_set)
        
        if len(job_skills_set) > 0:
            skill_match_ratio = len(matched_skills) / len(job_skills_set)
        else:
            # If no skills specified in job, use text-based matching
            skill_match_ratio = similarity_score
        
        print(f"Debug - Matched skills: {matched_skills}")
        print(f"Debug - Skill match ratio: {skill_match_ratio}")
        
        # 3. Keyword Matching
        keywords = self._extract_keywords(job_description)
        keyword_matches = []
        
        resume_lower = resume_text.lower()
        for keyword in keywords:
            count = resume_lower.count(keyword.lower())
            if count > 0:
                keyword_matches.append({
                    'keyword': keyword,
                    'count': count
                })
        
        keyword_score = min(len(keyword_matches) / max(len(keywords), 1), 1.0) if keywords else similarity_score
        print(f"Debug - Keyword score: {keyword_score}")
        
        # 4. Calculate Overall Match Score (0-100)
        # If we have good skill data, weight it more
        if len(job_skills_set) > 0:
            # Weighted combination when skills are available
            overall_score = (
                similarity_score * 0.3 +
                skill_match_ratio * 0.6 +
                keyword_score * 0.1
            ) * 100
        else:
            # Rely more on text similarity when no skills
            overall_score = (
                similarity_score * 0.7 +
                keyword_score * 0.3
            ) * 100
        
        # Ensure minimum score if there's any match
        if overall_score < 5 and (matched_skills or keyword_matches):
            overall_score = max(overall_score, 15)
        
        overall_score = round(max(0, min(100, overall_score)), 2)
        
        print(f"Debug - Final overall score: {overall_score}")
        
        # 5. Experience Match
        experience_match = self._check_experience_match(job_description, resume_text)
        
        return {
            'match_score': overall_score,
            'similarity_score': round(similarity_score * 100, 2),
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'skill_match_percentage': round(skill_match_ratio * 100, 2),
            'keyword_matches': keyword_matches[:10],
            'experience_match': experience_match,
            'recommendation': self._get_recommendation(overall_score)
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean text for better matching"""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters but keep alphanumeric and spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from job description"""
        try:
            # Use TF-IDF to get important terms
            vectorizer = TfidfVectorizer(
                max_features=20, 
                stop_words='english',
                min_df=1
            )
            tfidf_matrix = vectorizer.fit_transform([text])
            feature_names = vectorizer.get_feature_names_out()
            
            # Get top keywords
            tfidf_scores = tfidf_matrix.toarray()[0]
            top_indices = tfidf_scores.argsort()[-10:][::-1]
            
            keywords = [feature_names[i] for i in top_indices if i < len(feature_names)]
            return keywords
        except Exception as e:
            print(f"Error extracting keywords: {e}")
            # Fallback: extract common technical terms
            common_terms = re.findall(r'\b\w{4,}\b', text.lower())
            return list(set(common_terms))[:10]
    
    def _check_experience_match(self, job_desc: str, resume_text: str) -> bool:
        """Check if resume experience matches job requirements"""
        # Extract required years from job description
        job_exp_pattern = r'(\d+)\+?\s*years?\s*(?:of)?\s*experience'
        job_match = re.search(job_exp_pattern, job_desc.lower())
        
        # Extract candidate years from resume
        resume_match = re.search(job_exp_pattern, resume_text.lower())
        
        if job_match and resume_match:
            required_years = int(job_match.group(1))
            candidate_years = int(resume_match.group(1))
            return candidate_years >= required_years
        
        # If we can't determine, return True (give benefit of doubt)
        return True
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on score"""
        if score >= 75:
            return "Highly Recommended - Strong Match"
        elif score >= 60:
            return "Recommended - Good Match"
        elif score >= 45:
            return "Consider - Moderate Match"
        elif score >= 30:
            return "Review Manually - Low Match"
        else:
            return "Not Recommended - Poor Match"