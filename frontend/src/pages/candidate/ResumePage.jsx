import { useState, useEffect } from 'react';
import { resumeAPI } from '../../services/api';
import { Upload, FileText, Download, Trash2, Check, X } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ResumePage = () => {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await resumeAPI.getMy();
      setResume(response.data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await resumeAPI.upload(formData);
      setResume(response.data.data);
      setSelectedFile(null);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await resumeAPI.download(resume._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Resume downloaded');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      await resumeAPI.delete();
      setResume(null);
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Resume</h1>
        <p className="text-gray-400 mt-1">Upload and manage your resume</p>
      </div>

      {/* Upload Section */}
      {!resume && (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Upload Your Resume
            </h3>
            <p className="text-gray-400 mb-6">
              Upload your resume in PDF format (max 5MB)
            </p>

            <div className="max-w-md mx-auto">
              <label className="block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="btn-secondary cursor-pointer inline-flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Choose File
                </div>
              </label>

              {selectedFile && (
                <div className="mt-4 p-4 bg-dark-hover rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-primary-400" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full btn-primary"
                  >
                    {uploading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Details */}
      {resume && (
        <>
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary-500/10 rounded-lg">
                  <FileText className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {resume.fileName}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="btn-ghost flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-ghost text-red-400 hover:bg-red-500/10 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>

            {/* Parsed Data */}
            {resume.parsedData && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Extracted Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {resume.parsedData.name && (
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-white">{resume.parsedData.name}</p>
                      </div>
                    )}
                    {resume.parsedData.email && (
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-white">{resume.parsedData.email}</p>
                      </div>
                    )}
                    {resume.parsedData.phone && (
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-white">{resume.parsedData.phone}</p>
                      </div>
                    )}
                    {resume.parsedData.experience_years > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="text-white">
                          {resume.parsedData.experience_years} years
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">
                      Extracted Skills ({resume.parsedData.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.parsedData.skills.map((skill, index) => (
                        <span key={index} className="badge-primary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload New Resume */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Upload New Resume
            </h3>
            <p className="text-gray-400 mb-4">
              Replace your current resume with an updated version
            </p>

            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="btn-secondary cursor-pointer text-center">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Choose New File
                </div>
              </label>

              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 p-3 bg-dark-hover rounded-lg flex items-center justify-between">
                <span className="text-sm text-white">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResumePage;