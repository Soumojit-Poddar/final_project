import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { Plus, X, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'full-time',
    experience: { min: 0, max: 0 },
    salary: { min: 0, max: 0, currency: 'USD' },
    status: 'active',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getById(id);
      const job = response.data.data;

      setFormData({
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements,
        location: job.location || '',
        jobType: job.jobType,
        experience: job.experience || { min: 0, max: 0 },
        salary: job.salary || { min: 0, max: 0, currency: 'USD' },
        status: job.status,
      });

      setSkills(job.skills || []);
    } catch (error) {
      toast.error('Failed to load job');
      navigate('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };

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

    setSubmitting(true);
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

      await jobAPI.update(id, jobData);
      toast.success('Job updated successfully!');
      navigate(`/recruiter/jobs/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/recruiter/jobs/${id}`)}
          className="btn-ghost flex items-center mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Job Details
        </button>
        <h1 className="text-3xl font-bold text-white">Edit Job</h1>
        <p className="text-gray-400 mt-1">Update your job posting details</p>
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
            placeholder="Describe the role, responsibilities, team culture..."
            required
          />
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
            placeholder="List required qualifications, experience, education..."
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
        </div>

        {/* Experience Range */}
        <div>
          <label className="label">Experience Required (years)</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="experience.min"
              value={formData.experience.min}
              onChange={handleChange}
              className="input"
              placeholder="Minimum"
              min="0"
            />
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
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Updating...' : 'Update Job'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/recruiter/jobs/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;