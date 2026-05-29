import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'full-time',
    experience: { min: 0, max: 0 },
    salary: { min: 0, max: 0, currency: 'INR' },
    status: 'active',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim().toLowerCase())) {
      setSkills([...skills, skillInput.trim().toLowerCase()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (skills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        skills,
        experience: {
          min: parseInt(formData.experience.min) || 0,
          max: parseInt(formData.experience.max) || 0,
        },
        salary: {
          min: parseInt(formData.salary.min) || 0,
          max: parseInt(formData.salary.max) || 0,
          currency: formData.salary.currency,
        }
      };

      await jobAPI.create(jobData);
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Post New Job</h1>
        <p className="text-gray-400 mt-1">Create a new job posting to attract top talent</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div>
              <label className="label">Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input"
                placeholder="Your company name"
                required
              />
            </div>

            <div>
              <label className="label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Remote, New York, Hybrid"
              />
            </div>

            <div>
              <label className="label">Job Type *</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="label">Job Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="6"
            placeholder="Describe the role, responsibilities, team culture, and what makes this opportunity unique..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Be detailed - this helps our AI match the right candidates
          </p>
        </div>

        {/* Requirements */}
        <div>
          <label className="label">Requirements *</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="input"
            rows="4"
            placeholder="List required qualifications, experience, education, and any must-have skills..."
            required
          />
        </div>

        {/* Skills */}
        <div>
          <label className="label">Required Skills *</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input flex-1"
              placeholder="Type a skill and press Enter"
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="badge-primary flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Add skills for better candidate matching (e.g., JavaScript, React, Python)
          </p>
        </div>

        {/* Experience Range */}
        <div>
          <label className="label">Experience Required (years)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                name="experience.min"
                value={formData.experience.min}
                onChange={handleChange}
                className="input"
                placeholder="Minimum"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                name="experience.max"
                value={formData.experience.max}
                onChange={handleChange}
                className="input"
                placeholder="Maximum"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="label">Salary Range (Optional)</label>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="salary.min"
              value={formData.salary.min}
              onChange={handleChange}
              className="input"
              placeholder="Minimum"
              min="0"
            />
            <input
              type="number"
              name="salary.max"
              value={formData.salary.max}
              onChange={handleChange}
              className="input"
              placeholder="Maximum"
              min="0"
            />
            <select
              name="salary.currency"
              value={formData.salary.currency}
              onChange={handleChange}
              className="input"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="active">Active - Start accepting applications</option>
            <option value="draft">Draft - Save for later</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;