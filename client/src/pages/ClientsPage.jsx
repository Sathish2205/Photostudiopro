import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const emptyForm = { name: '', phone: '', email: '', address: '', notes: '' };

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientDetail, setClientDetail] = useState(null);

    const load = () => {
        api.get('/clients', { params: search ? { search } : {} })
            .then((res) => setClients(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [search]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '', notes: c.notes || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/clients/${editing._id}`, form);
                toast.success('Client updated');
            } else {
                await api.post('/clients', form);
                toast.success('Client added');
            }
            setShowModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this client?')) return;
        try { await api.delete(`/clients/${id}`); toast.success('Client deleted'); load(); } catch { toast.error('Error'); }
    };

    const viewDetail = async (c) => {
        setSelectedClient(c);
        try {
            const res = await api.get(`/clients/${c._id}`);
            setClientDetail(res.data);
        } catch { toast.error('Error loading detail'); }
    };

    const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold gradient-text">Clients</h2>
                    <p className="text-dark-500 text-sm">Manage your client database</p>
                </div>
                <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium text-sm rounded-xl hover:from-studio-500 hover:to-studio-400 transition-all shadow-lg shadow-studio-500/20 flex items-center gap-2">
                    <Plus size={16} /> New Client
                </button>
            </div>

            {/* Search */}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full max-w-md px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm placeholder-dark-600 focus:ring-studio-500 focus:border-studio-500 focus:outline-none"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client list */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-studio-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : clients.length === 0 ? (
                        <div className="glass rounded-2xl p-12 text-center"><p className="text-dark-500">No clients found.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {clients.map((c) => (
                                <div key={c._id} onClick={() => viewDetail(c)}
                                    className={`glass rounded-xl p-4 cursor-pointer hover:border-studio-500/30 transition-all ${selectedClient?._id === c._id ? 'border-studio-500' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-studio-400 to-studio-600 flex items-center justify-center text-white font-bold text-sm">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-dark-200 font-medium text-sm">{c.name}</p>
                                                <p className="text-dark-500 text-xs">{c.phone} {c.email ? `• ${c.email}` : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-studio-400 hover:text-studio-300 text-xs">Edit</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Client detail panel */}
                <div className="glass rounded-2xl p-6">
                    {!clientDetail ? (
                        <p className="text-dark-500 text-sm text-center py-8">Select a client to view details.</p>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-studio-400 to-studio-600 flex items-center justify-center text-white font-bold text-xl mb-3">
                                    {clientDetail.client.name.charAt(0)}
                                </div>
                                <h3 className="text-lg font-bold text-dark-100">{clientDetail.client.name}</h3>
                                <p className="text-dark-500 text-sm">{clientDetail.client.phone}</p>
                            </div>
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-dark-500">Bookings</p>
                                    <p className="text-lg font-bold text-dark-200">{clientDetail.stats.totalBookings}</p>
                                </div>
                                <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-dark-500">Total Paid</p>
                                    <p className="text-lg font-bold text-green-400">{fmt(clientDetail.stats.totalPaid)}</p>
                                </div>
                                <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-dark-500">Total Cost</p>
                                    <p className="text-lg font-bold text-dark-200">{fmt(clientDetail.stats.totalCost)}</p>
                                </div>
                                <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-dark-500">Pending</p>
                                    <p className="text-lg font-bold text-orange-400">{fmt(clientDetail.stats.pendingBalance)}</p>
                                </div>
                            </div>
                            {/* Recent events */}
                            {clientDetail.events.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-dark-300 mb-2">Recent Events</h4>
                                    <div className="space-y-2">
                                        {clientDetail.events.slice(0, 5).map((ev) => (
                                            <div key={ev._id} className="bg-dark-800/50 rounded-lg p-2.5 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-dark-300">{ev.eventType}</span>
                                                    <span className="text-dark-500">{new Date(ev.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-6">{editing ? 'Edit Client' : 'New Client'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Name *</label>
                                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50 focus:border-studio-500" placeholder="Full name" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Phone *</label>
                                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" placeholder="email@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Address</label>
                                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Notes</label>
                                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm resize-none"></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium rounded-xl text-sm">{editing ? 'Update' : 'Add Client'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
