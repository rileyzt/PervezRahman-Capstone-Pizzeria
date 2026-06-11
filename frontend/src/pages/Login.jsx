// LOGIN PAGE — using Bootstrap form and card classes

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '85vh' }}>
      <div className="card border-dark-custom p-4 p-md-5" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 className="fw-bold text-white text-center mb-1">Sign In</h2>
        <p className="text-secondary text-center mb-4" style={{ fontSize: '0.9rem' }}>Welcome back to Pizzeria</p>

        {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem', background: 'rgba(229,9,20,0.1)', border: 'none', color: '#E50914' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="email" className="form-control py-3" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <input type="password" className="form-control py-3" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-danger w-100 py-3 fw-bold" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-secondary text-center mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
          New to Pizzeria? <Link to="/register" className="text-brand fw-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
