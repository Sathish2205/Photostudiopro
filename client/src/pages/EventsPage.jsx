import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, CreditCard, ArrowLeft } from 'lucide-react';

const EVENT_TYPES = ['Wedding', 'Puberty', 'Baby Shower', 'Birthday', 'Corporate', 'Outdoor Shoot', 'Portrait', 'Product', 'Other'];
const STATUSES = ['Booked', 'In Progress', 'Completed', 'Delivered'];
const PAY_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];

function StatusBadge({ status }) {
    const cls = {
        'Booked': 'badge-booked',
        'In Progress': 'badge-inprogress',
        'Completed': 'badge-completed',
        'Delivered': 'badge-delivered',
    }[status] || 'bg-dark-700';
    return <span className={`${cls} text-white text-xs px-3 py-1 rounded-full font-medium`}>{status}</span>;
}

const emptyForm = { client: '', eventType: 'Wedding', date: '', location: '', packageSelected: '', packageCost: 0, advancePaid: 0, photographer: '', backupLocation: '', notes: '' };

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [filter, setFilter] = useState({ status: '', eventType: '' });
    const [search, setSearch] = useState('');
    const [newClient, setNewClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [payModal, setPayModal] = useState(null);
    const [payAmount, setPayAmount] = useState(0);
    const [payMethod, setPayMethod] = useState('Cash');

    const load = () => {
        const params = {};
        if (filter.status) params.status = filter.status;
        if (filter.eventType) params.eventType = filter.eventType;
        Promise.all([api.get('/events', { params }), api.get('/clients')])
            .then(([evRes, clRes]) => { setEvents(evRes.data); setClients(clRes.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [filter]);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setNewClient(false); setNewClientName(''); setNewClientPhone(''); setShowModal(true); };

    const openEdit = (ev) => {
        setEditing(ev);
        setNewClient(false);
        setForm({
            client: ev.client?._id || ev.client,
            eventType: ev.eventType,
            date: ev.date?.slice(0, 10),
            location: ev.location,
            packageSelected: ev.packageSelected,
            packageCost: ev.packageCost,
            advancePaid: ev.advancePaid,
            photographer: ev.photographer || '',
            backupLocation: ev.backupLocation || '',
            notes: ev.notes,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let clientId = form.client;

            // If adding a new client inline, create them first
            if (newClient) {
                if (!newClientName.trim() || !newClientPhone.trim()) {
                    toast.error('Please enter client name and phone');
                    return;
                }
                const clientRes = await api.post('/clients', { name: newClientName, phone: newClientPhone });
                clientId = clientRes.data._id;
                toast.success(`Client "${newClientName}" added!`);
            }

            if (!clientId) {
                toast.error('Please select or add a client');
                return;
            }

            const eventData = { ...form, client: clientId };

            if (editing) {
                await api.put(`/events/${editing._id}`, eventData);
                toast.success('Event updated');
            } else {
                await api.post('/events', eventData);
                toast.success('Event created');
            }
            setShowModal(false);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving event');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            toast.success('Event deleted');
            load();
        } catch { toast.error('Error deleting'); }
    };

    const handleStatus = async (id, status) => {
        try {
            await api.patch(`/events/${id}/status`, { status });
            toast.success('Status updated');
            load();
        } catch { toast.error('Error updating status'); }
    };

    const openPay = (ev) => { setPayModal(ev); setPayAmount(0); setPayMethod('Cash'); };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/payments', {
                event: payModal._id,
                client: payModal.client?._id || payModal.client,
                amount: payAmount,
                method: payMethod,
            });
            toast.success(`₹${payAmount.toLocaleString('en-IN')} payment recorded!`);
            setPayModal(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error recording payment');
        }
    };

    const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold gradient-text">Events</h2>
                    <p className="text-dark-500 text-sm">Manage your photography events</p>
                </div>
                <button id="add-event-btn" onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium text-sm rounded-xl hover:from-studio-500 hover:to-studio-400 transition-all shadow-lg shadow-studio-500/20 flex items-center gap-2">
                    <Plus size={16} /> New Event
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
                    className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-studio-500/50 min-w-[220px]"
                />
                <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="bg-dark-800 border border-dark-700 text-dark-300 text-sm rounded-xl px-4 py-2 focus:ring-studio-500 focus:border-studio-500">
                    <option value="">All Status</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filter.eventType} onChange={(e) => setFilter({ ...filter, eventType: e.target.value })} className="bg-dark-800 border border-dark-700 text-dark-300 text-sm rounded-xl px-4 py-2 focus:ring-studio-500 focus:border-studio-500">
                    <option value="">All Types</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Table */}
            {(() => {
                const q = search.toLowerCase();
                const filtered = events.filter((ev) =>
                    !q ||
                    (ev.client?.name || '').toLowerCase().includes(q) ||
                    (ev.client?.phone || '').toLowerCase().includes(q) ||
                    ev.eventType.toLowerCase().includes(q) ||
                    ev.location.toLowerCase().includes(q) ||
                    (ev.photographer || '').toLowerCase().includes(q) ||
                    (ev.packageSelected || '').toLowerCase().includes(q)
                );
                return loading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-studio-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="glass rounded-2xl p-12 text-center"><p className="text-dark-500">{events.length === 0 ? 'No events found. Create your first event!' : 'No events match your search.'}</p></div>
                ) : (
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-dark-700/50 text-dark-500 text-left">
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Client</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Photographer</th>
                                        <th className="px-6 py-4 font-medium">Location</th>
                                        <th className="px-6 py-4 font-medium">Package Cost</th>
                                        <th className="px-6 py-4 font-medium">Balance</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((ev) => (
                                        <tr key={ev._id} className="border-b border-dark-700/30 hover:bg-dark-800/40 transition-colors">
                                            <td className="px-6 py-4 text-dark-200">{new Date(ev.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-dark-200 font-medium">{ev.client?.name || '—'}</p>
                                                <p className="text-dark-500 text-xs">{ev.client?.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-dark-300">{ev.eventType}</td>
                                            <td className="px-6 py-4 text-dark-300">{ev.photographer || '—'}</td>
                                            <td className="px-6 py-4 text-dark-400">{ev.location}</td>
                                            <td className="px-6 py-4 text-dark-200">{fmt(ev.packageCost)}</td>
                                            <td className="px-6 py-4 text-orange-400">{fmt(ev.remainingBalance)}</td>
                                            <td className="px-6 py-4"><StatusBadge status={ev.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={ev.status}
                                                        onChange={(e) => handleStatus(ev._id, e.target.value)}
                                                        className="bg-dark-800 border border-dark-700 text-xs rounded-lg px-2 py-1 text-dark-300"
                                                    >
                                                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <button onClick={() => openPay(ev)} className="text-green-400 hover:text-green-300 text-xs font-medium flex items-center gap-1"><CreditCard size={12} /> Pay</button>
                                                    <button onClick={() => openEdit(ev)} className="text-studio-400 hover:text-studio-300 text-xs">Edit</button>
                                                    <button onClick={() => handleDelete(ev._id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-6">{editing ? 'Edit Event' : 'New Event'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm text-dark-400">Client *</label>
                                    <button type="button" onClick={() => setNewClient(!newClient)} className="text-xs text-studio-400 hover:text-studio-300 transition-colors flex items-center gap-1">
                                        {newClient ? <><ArrowLeft size={12} /> Select Existing</> : <><Plus size={12} /> New Client</>}
                                    </button>
                                </div>
                                {newClient ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" required value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" placeholder="Client Name" />
                                        <input type="text" required value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" placeholder="Phone Number" />
                                    </div>
                                ) : (
                                    <select required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm">
                                        <option value="">Select client</option>
                                        {clients.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>)}
                                    </select>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Event Type *</label>
                                    <select required value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm">
                                        {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Event Date *</label>
                                    <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Location *</label>
                                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" placeholder="Venue name or address" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Photographer</label>
                                <input value={form.photographer} onChange={(e) => setForm({ ...form, photographer: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" placeholder="Photographer name" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Backup Location</label>
                                <input value={form.backupLocation} onChange={(e) => setForm({ ...form, backupLocation: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" placeholder="HDD #1, NAS, Drive Link..." />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Package</label>
                                    <input value={form.packageSelected} onChange={(e) => setForm({ ...form, packageSelected: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" placeholder="Gold" />
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Cost (₹)</label>
                                    <input type="number" min="0" value={form.packageCost} onChange={(e) => setForm({ ...form, packageCost: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Advance (₹)</label>
                                    <input type="number" min="0" value={form.advancePaid} onChange={(e) => setForm({ ...form, advancePaid: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Notes</label>
                                <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm resize-none" placeholder="Any additional notes..."></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium rounded-xl hover:from-studio-500 hover:to-studio-400 transition-all text-sm">
                                    {editing ? 'Update Event' : 'Create Event'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl hover:bg-dark-700 transition-colors text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Pay Modal */}
            {payModal && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-2">Record Payment</h3>
                        <p className="text-dark-500 text-sm mb-1">{payModal.eventType} — {payModal.client?.name}</p>
                        <div className="flex gap-4 text-xs text-dark-400 mb-5">
                            <span>Cost: {fmt(payModal.packageCost)}</span>
                            <span>Paid: {fmt(payModal.advancePaid)}</span>
                            <span className="text-orange-400">Due: {fmt(payModal.remainingBalance)}</span>
                        </div>
                        <form onSubmit={handlePay} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Amount (₹) *</label>
                                <input type="number" required min="1" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-studio-500/50" placeholder="Enter amount" />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Method</label>
                                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm">
                                    {PAY_METHODS.map((m) => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-xl text-sm">Save Payment</button>
                                <button type="button" onClick={() => setPayModal(null)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
