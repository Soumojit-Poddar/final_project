import { Link } from 'react-router-dom';
import { Briefcase, Target, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms match candidates to jobs with precision',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Screening',
      description: 'Automated resume parsing and skill extraction saves hours',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Detailed Analytics',
      description: 'Get comprehensive match scores and skill gap analysis',
    },
  ];

  const benefits = [
    'Upload resume once, apply to multiple jobs',
    'Get instant match scores for every application',
    'Identify skill gaps and improve your profile',
    'Track all applications in one dashboard',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-purple-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
                Career Match
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              AI-powered resume screening platform that connects top talent with dream jobs.
              Get matched based on skills, experience, and cultural fit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-primary-400">95%</div>
                <div className="text-gray-400 mt-1">Match Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-400">10k+</div>
                <div className="text-gray-400 mt-1">Jobs Posted</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary-400">5k+</div>
                <div className="text-gray-400 mt-1">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose NEXUS?
            </h2>
            <p className="text-gray-400 text-lg">
              Powerful features designed for modern job searching
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:border-primary-500 transition-all">
                <div className="w-12 h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4 text-primary-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Everything you need to land your dream job
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Our AI-powered platform streamlines the entire job application process,
                giving you insights and tools to succeed.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-primary-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="btn-primary mt-8 inline-flex items-center">
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="relative">
              <div className="card p-8">
                <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg p-6 mb-4">
                  <div className="text-white text-sm font-medium mb-2">Match Score</div>
                  <div className="text-white text-4xl font-bold">87%</div>
                  <div className="text-primary-100 text-sm mt-2">Highly Recommended</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Matched Skills</span>
                    <span className="text-green-400 text-sm font-medium">8/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Experience Match</span>
                    <span className="text-green-400 text-sm font-medium">✓ Yes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Similarity Score</span>
                    <span className="text-primary-400 text-sm font-medium">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Briefcase className="w-16 h-16 text-primary-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your hiring process?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of companies and candidates using NEXUS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;