import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Wallet, Mail, Lock, Info } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back, Photographer!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated accent circles */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-studio-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-studio-800/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="relative w-full max-w-4xl flex flex-col lg:flex-row items-stretch glass-premium rounded-[2rem] overflow-hidden luxury-border animate-fadeIn">

                {/* Left Pane: Branding/Hero */}
                <div className="lg:w-1/2 p-8 flex flex-col justify-between relative bg-dark-900/40">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-studio-500 to-studio-700 flex items-center justify-center text-white font-bold text-lg shadow-2xl shadow-studio-600/30">
                                P
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-white">PhotoStudio <span className="text-studio-400">Pro</span></h2>
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                            Capture Every <br />
                            <span className="gradient-text">Detail.</span>
                        </h3>
                        <p className="text-dark-300 text-sm max-w-sm leading-relaxed">
                            The intelligent hub for professional photographers. Manage clients, bookings, and finances in one seamless experience.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-3 text-dark-400">
                            <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-studio-400">
                                <Camera size={18} />
                            </div>
                            <span className="text-xs font-medium">Capture & Organize</span>
                        </div>
                        <div className="flex items-center gap-3 text-dark-400">
                            <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-studio-400">
                                <Wallet size={18} />
                            </div>
                            <span className="text-xs font-medium">Financial Clarity</span>
                        </div>
                    </div>

                    {/* Decorative Aperture Element */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 border-[32px] border-white/[0.02] rounded-full animate-float" />
                </div>

                {/* Right Pane: Login Form */}
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-dark-950/20">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-dark-400 text-sm">Please enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-dark-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-500 group-focus-within:text-studio-400 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@studio.com"
                                    className="w-full pl-12 pr-4 py-3 bg-dark-900/60 border border-dark-700/50 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-studio-500/30 focus:border-studio-500/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-dark-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-500 group-focus-within:text-studio-400 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    id="login-password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-dark-900/60 border border-dark-700/50 rounded-xl text-white placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-studio-500/30 focus:border-studio-500/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-studio-600 focus:ring-offset-dark-950" />
                                <span className="text-sm text-dark-400 group-hover:text-dark-300">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => toast('Contact your administrator for password recovery.', { icon: <Info size={18} className="text-studio-400" /> })}
                                className="text-sm font-medium text-studio-400 hover:text-studio-300 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            id="login-button"
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-bold rounded-2xl hover:from-studio-500 hover:to-studio-400 transition-all shadow-xl shadow-studio-600/20 disabled:opacity-50 active:scale-[0.98] transform"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                'Sign in to Dashboard'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-dark-600 tracking-wider uppercase">
                        Enterprise Grade Studio Solutions
                    </p>
                </div>
            </div>
        </div>
    );
}
