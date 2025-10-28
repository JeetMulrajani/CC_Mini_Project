import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple authentication - in a real app, this would validate against a backend
    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      loginTime: new Date().toISOString()
    };

    onLogin(userData);
    navigate('/topic');
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--primary-gradient)', 
            borderRadius: '50%', 
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-lg)'
          }}>
            🧠
          </div>
          <h1 className="title">Welcome to Quiz Generator</h1>
          <p className="subtitle">Create and take personalized quizzes on any topic</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button 
            type="submit" 
            className="btn"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Signing In...
              </span>
            ) : (
              'Get Started'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          background: 'var(--gray-50)', 
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: '600', 
            color: 'var(--gray-700)', 
            marginBottom: '1rem' 
          }}>
            🚀 Features
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--gray-600)'
          }}>
            <div>✨ Custom Topics</div>
            <div>⏱️ Timed Quizzes</div>
            <div>📊 Score Tracking</div>
            <div>📱 Mobile Friendly</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
