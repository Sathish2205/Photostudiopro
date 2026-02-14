import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });

    // For password reset
    const [resetModal, setResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 'admin') {
            toast.error('Access denied');
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, authLoading, navigate]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/users', form);
            toast.success('User created successfully');
            setShowModal(false);
            setForm({ name: '', email: '', password: '', role: 'admin' });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetModal) return;
        try {
            await api.put(`/auth/users/${resetModal._id}/password`, { newPassword });
            toast.success(`Password reset for ${resetModal.name}`);
            setResetModal(null);
            setNewPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        }
    };

    if (loading) return <div className="p-8 text-center text-dark-400">Loading users...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8 animate-fadeIn">
                <div>
                    <h2 className="text-2xl font-bold text-dark-100">User Management</h2>
                    <p className="text-dark-400 text-sm">Manage access and permissions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-studio-600 to-studio-500 text-white rounded-xl shadow-lg shadow-studio-500/20 hover:from-studio-500 hover:to-studio-400 transition-all"
                >
                    <span className="text-lg">+</span> New User
                </button>
            </div>

            {/* Users Table */}
            <div className="glass rounded-2xl overflow-hidden animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dark-800/50 text-xs uppercase text-dark-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700/50">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-dark-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs text-white font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-dark-200">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-dark-300 text-sm">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-lg bg-studio-500/10 text-studio-400 border border-studio-500/20 uppercase tracking-wider">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setResetModal(u)}
                                            className="text-studio-400 hover:text-studio-300 text-xs font-medium"
                                        >
                                            Reset Password
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-6">Create New User</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Full Name</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Email</label>
                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Password</label>
                                <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium rounded-xl text-sm">Create User</button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetModal && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-2">Reset Password</h3>
                        <p className="text-dark-400 text-sm mb-6">Set a new password for <strong className="text-white">{resetModal.name}</strong></p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">New Password</label>
                                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-medium rounded-xl text-sm">Reset Password</button>
                                <button type="button" onClick={() => { setResetModal(null); setNewPassword(''); }} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
