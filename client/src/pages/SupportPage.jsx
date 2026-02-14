import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MessageSquare, Phone } from 'lucide-react';

export default function SupportPage() {
    const [formData, setFormData] = useState({ subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            toast.success('Support request sent! We will get back to you shortly.');
            setFormData({ subject: '', message: '' });
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold gradient-text">Support Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Options */}
                <div className="space-y-4">
                    <div className="glass p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-studio-600/20 flex items-center justify-center text-studio-400">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Email Us</h3>
                            <p className="text-xs text-dark-400">support@photostudio.pro</p>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-studio-600/20 flex items-center justify-center text-studio-400">
                            <Phone size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Call Us</h3>
                            <p className="text-xs text-dark-400">+91 8807071314</p>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-studio-600/20 flex items-center justify-center text-studio-400">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Live Chat</h3>
                            <p className="text-xs text-dark-400">Available 9am - 6pm</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2 glass p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-dark-400 mb-1">Subject</label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50"
                                placeholder="How can we help?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-400 mb-1">Message</label>
                            <textarea
                                rows={5}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50 resize-none"
                                placeholder="Describe your issue..."
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-bold rounded-xl hover:from-studio-500 hover:to-studio-400 transition-all shadow-lg shadow-studio-500/20"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
