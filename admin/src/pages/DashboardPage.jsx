import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, Shield, LogOut, KeyRound,
    Crown, User as UserIcon, X, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [resetModal, setResetModal] = useState(null);
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/login', { replace: true });
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const staffCount = users.filter(u => u.role === 'staff').length;

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner" />
                <span>Loading admin panel...</span>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1a1a28',
                        color: '#f0f0f5',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                    },
                }}
            />

            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-logo">
                        <div className="dashboard-logo-icon">P</div>
                        <div className="dashboard-logo-text">
                            PhotoStudio <span>Pro</span>
                        </div>
                    </div>
                    <span className="dashboard-header-badge">Admin</span>
                </div>
                <div className="dashboard-header-right">
                    <div className="dashboard-user-info">
                        <div className="dashboard-user-name">{adminUser.name}</div>
                        <div className="dashboard-user-role">{adminUser.role}</div>
                    </div>
                    <button className="btn-icon" onClick={handleLogout} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="dashboard-content">
                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-icon stat-card-icon--purple">
                            <Users size={20} />
                        </div>
                        <div className="stat-card-value">{users.length}</div>
                        <div className="stat-card-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon stat-card-icon--yellow">
                            <Crown size={20} />
                        </div>
                        <div className="stat-card-value">{adminCount}</div>
                        <div className="stat-card-label">Admins</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon stat-card-icon--green">
                            <UserIcon size={20} />
                        </div>
                        <div className="stat-card-value">{staffCount}</div>
                        <div className="stat-card-label">Staff</div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <Users size={18} />
                            User Management
                            <span className="section-title-count">{users.length}</span>
                        </h2>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} style={{ width: 'auto' }}>
                            <UserPlus size={14} />
                            Add User
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="table-empty">
                                                <div className="table-empty-icon"><Users size={40} /></div>
                                                <p>No users found. Add your first user above.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="table-user-info">
                                                    <div className="table-user-avatar">
                                                        {user.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="table-user-name">{user.name}</div>
                                                        <div className="table-user-email">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge role-badge--${user.role}`}>
                                                    {user.role === 'admin' ? <Crown size={12} /> : <UserIcon size={12} />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setResetModal(user)}
                                                        title="Reset password"
                                                    >
                                                        <KeyRound size={13} />
                                                        Reset Password
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchUsers();
                    }}
                />
            )}

            {/* Reset Password Modal */}
            {resetModal && (
                <ResetPasswordModal
                    user={resetModal}
                    onClose={() => setResetModal(null)}
                />
            )}
        </div>
    );
}

/* ========================================
   Add User Modal
   ======================================== */
function AddUserModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/users', form);
            toast.success('User created successfully!');
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Add New User</h3>
                    <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-text">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input form-input--no-icon"
                                placeholder="Enter full name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input form-input--no-icon"
                                placeholder="user@studio.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="form-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input form-input--no-icon"
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    minLength={6}
                                    required
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                className="form-select"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-success btn-sm" disabled={loading} style={{ padding: '10px 20px' }}>
                            {loading ? <div className="spinner" /> : <><UserPlus size={14} /> Create User</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ========================================
   Reset Password Modal
   ======================================== */
function ResetPasswordModal({ user, onClose }) {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.put(`/auth/users/${user._id}/password`, { newPassword });
            toast.success(`Password reset for ${user.name}`);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Reset Password</h3>
                    <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                            Set a new password for <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong> ({user.email})
                        </p>

                        {error && <div className="error-text">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div className="form-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input form-input--no-icon"
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-success btn-sm" disabled={loading} style={{ padding: '10px 20px' }}>
                            {loading ? <div className="spinner" /> : <><RefreshCw size={14} /> Reset Password</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
