import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Camera,
    Calendar,
    Users,
    IndianRupee,
    Clapperboard,
    FileText,
    KeyRound,
    LogOut,
    Menu
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/events', label: 'Events', icon: Camera },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/finance', label: 'Finance', icon: IndianRupee },
    { path: '/workflow', label: 'Workflow', icon: Clapperboard },
    { path: '/reports', label: 'Reports', icon: FileText },
];

import api from '../api';
import toast from 'react-hot-toast';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/password', passwordForm);
            toast.success('Password updated successfully');
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating password');
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark-900 border-r border-dark-700/50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-studio-500 to-studio-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-studio-500/20">
                            P
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">PhotoStudio</h1>
                            <p className="text-xs text-dark-500">Management Pro</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems
                        .filter(item => item.path !== '/users' || user?.role === 'admin')
                        .map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-studio-600/20 text-studio-300 shadow-lg shadow-studio-500/5'
                                        : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                {item.label}
                            </NavLink>
                        ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-dark-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-studio-400 to-studio-600 flex items-center justify-center text-white text-sm font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-200 truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <button
                            className="w-full px-4 py-2 text-sm text-dark-400 hover:text-studio-300 hover:bg-studio-500/10 rounded-lg transition-colors text-left flex items-center gap-3"
                        >
                            <KeyRound size={16} /> Change Password
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left flex items-center gap-3"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 glass flex items-center justify-between px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-dark-500 bg-dark-800 px-3 py-1.5 rounded-full">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    <div className="animate-fadeIn">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-dark-700/50 py-6 px-6 bg-dark-900/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dark-500">
                        <p>© 2026 PhotoStudio Pro. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <NavLink to="/privacy" className="hover:text-studio-400 transition-colors">Privacy Policy</NavLink>
                            <NavLink to="/terms" className="hover:text-studio-400 transition-colors">Terms of Service</NavLink>
                            <NavLink to="/support" className="hover:text-studio-400 transition-colors">Support</NavLink>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-6">Change Password</h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium rounded-xl text-sm">Update</button>
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
