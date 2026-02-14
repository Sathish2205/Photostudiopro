import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
import api from '../api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', form);

            if (data.user.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo">
                    <img src="/logo.svg" alt="PhotoStudio Pro" className="login-logo-image" style={{ width: '48px', height: '48px' }} />
                    <div className="login-logo-text">
                        PhotoStudio <span>Pro</span>
                    </div>
                </div>

                <div className="login-badge">
                    <Shield size={12} />
                    Admin Panel
                </div>

                <h1 className="login-title">Admin Access</h1>
                <p className="login-subtitle">Sign in with your admin credentials to manage users.</p>

                {error && <div className="error-text">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="form-input-wrapper">
                            <Mail size={16} className="form-input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter Admin Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="form-input-wrapper">
                            <Lock size={16} className="form-input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <div className="spinner" /> : 'Sign In to Admin Panel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
