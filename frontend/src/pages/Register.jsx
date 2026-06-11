// REGISTER PAGE — using Bootstrap form and card classes

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // client-side validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '85vh' }}>
      <div className="card border-dark-custom p-4 p-md-5" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 className="fw-bold text-white text-center mb-1">Create Account</h2>
        <p className="text-secondary text-center mb-4" style={{ fontSize: '0.9rem' }}>Join Pizzeria today</p>

        {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem', background: 'rgba(229,9,20,0.1)', border: 'none', color: '#E50914' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" className="form-control py-3" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <input type="email" className="form-control py-3" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control py-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control py-3" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="mb-4">
            <input type="text" className="form-control py-3" placeholder="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-danger w-100 py-3 fw-bold" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-secondary text-center mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" className="text-brand fw-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
