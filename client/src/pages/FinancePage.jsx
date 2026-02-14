import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const EXPENSE_CATS = ['Equipment', 'Travel', 'Editing', 'Staff Payment', 'Rent', 'Print', 'Marketing', 'Other'];
const PAY_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];

export default function FinancePage() {
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [payments, setPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayForm, setShowPayForm] = useState(false);
    const [payForm, setPayForm] = useState({ event: '', client: '', amount: 0, method: 'Cash', notes: '' });
    const [showExpForm, setShowExpForm] = useState(false);
    const [expForm, setExpForm] = useState({ category: 'Equipment', amount: 0, description: '', date: new Date().toISOString().slice(0, 10) });

    const load = () => {
        Promise.all([
            api.get('/finance/dashboard'),
            api.get('/finance/payments'),
            api.get('/finance/expenses'),
            api.get('/events'),
        ]).then(([d, p, e, ev]) => {
            setStats(d.data); setPayments(p.data); setExpenses(e.data); setEvents(ev.data);
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleEventSelect = (eventId) => {
        const ev = events.find((e) => e._id === eventId);
        setPayForm({ ...payForm, event: eventId, client: ev?.client?._id || ev?.client || '' });
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        try { await api.post('/finance/payments', payForm); toast.success('Payment recorded'); setShowPayForm(false); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const submitExpense = async (e) => {
        e.preventDefault();
        try { await api.post('/finance/expenses', expForm); toast.success('Expense recorded'); setShowExpForm(false); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const deletePayment = async (id) => {
        if (!confirm('Delete?')) return;
        try { await api.delete(`/finance/payments/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
    };

    const deleteExpense = async (id) => {
        if (!confirm('Delete?')) return;
        try { await api.delete(`/finance/expenses/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Error'); }
    };

    const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

    if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-studio-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold gradient-text">Finance</h2>
                <p className="text-dark-500 text-sm">Track payments, expenses, and profitability</p>
            </div>

            <div className="flex gap-1 bg-dark-800/50 p-1 rounded-xl w-fit">
                {['overview', 'payments', 'expenses'].map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 text-sm rounded-lg font-medium transition-all capitalize ${tab === t ? 'bg-studio-600/20 text-studio-300' : 'text-dark-400 hover:text-dark-200'}`}>{t}</button>
                ))}
            </div>

            {tab === 'overview' && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass rounded-2xl p-6"><p className="text-dark-500 text-sm">Total Revenue</p><p className="text-2xl font-bold text-green-400 mt-1">{fmt(stats.totalRevenue)}</p></div>
                    <div className="glass rounded-2xl p-6"><p className="text-dark-500 text-sm">Total Received</p><p className="text-2xl font-bold text-studio-400 mt-1">{fmt(stats.totalPaid)}</p></div>
                    <div className="glass rounded-2xl p-6"><p className="text-dark-500 text-sm">Pending</p><p className="text-2xl font-bold text-orange-400 mt-1">{fmt(stats.pendingPayments)}</p></div>
                    <div className="glass rounded-2xl p-6"><p className="text-dark-500 text-sm">Expenses</p><p className="text-2xl font-bold text-red-400 mt-1">{fmt(stats.totalExpenses)}</p></div>
                    <div className="glass rounded-2xl p-6 sm:col-span-2 lg:col-span-4"><p className="text-dark-500 text-sm">Net Profit</p><p className={`text-3xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(stats.netProfit)}</p></div>
                </div>
            )}

            {tab === 'payments' && (
                <div className="space-y-4">
                    <button onClick={() => setShowPayForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium text-sm rounded-xl">+ Record Payment</button>
                    {payments.length === 0 ? <div className="glass rounded-2xl p-12 text-center text-dark-500">No payments yet.</div> : (
                        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-700/50 text-dark-500 text-left">
                                    <th className="px-6 py-4 font-medium">Date</th><th className="px-6 py-4 font-medium">Client</th><th className="px-6 py-4 font-medium">Event</th><th className="px-6 py-4 font-medium">Amount</th><th className="px-6 py-4 font-medium">Method</th><th className="px-6 py-4 font-medium">Actions</th>
                                </tr></thead>
                                <tbody>{payments.map((p) => (
                                    <tr key={p._id} className="border-b border-dark-700/30 hover:bg-dark-800/40">
                                        <td className="px-6 py-4 text-dark-300">{new Date(p.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-dark-200">{p.client?.name || '—'}</td>
                                        <td className="px-6 py-4 text-dark-400">{p.event?.eventType || '—'}</td>
                                        <td className="px-6 py-4 text-green-400 font-medium">{fmt(p.amount)}</td>
                                        <td className="px-6 py-4 text-dark-400">{p.method}</td>
                                        <td className="px-6 py-4"><button onClick={() => deletePayment(p._id)} className="text-red-400 text-xs">Delete</button></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === 'expenses' && (
                <div className="space-y-4">
                    <button onClick={() => setShowExpForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium text-sm rounded-xl">+ Add Expense</button>
                    {expenses.length === 0 ? <div className="glass rounded-2xl p-12 text-center text-dark-500">No expenses yet.</div> : (
                        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-700/50 text-dark-500 text-left">
                                    <th className="px-6 py-4 font-medium">Date</th><th className="px-6 py-4 font-medium">Category</th><th className="px-6 py-4 font-medium">Amount</th><th className="px-6 py-4 font-medium">Description</th><th className="px-6 py-4 font-medium">Actions</th>
                                </tr></thead>
                                <tbody>{expenses.map((e) => (
                                    <tr key={e._id} className="border-b border-dark-700/30 hover:bg-dark-800/40">
                                        <td className="px-6 py-4 text-dark-300">{new Date(e.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-dark-200">{e.category}</td>
                                        <td className="px-6 py-4 text-red-400 font-medium">{fmt(e.amount)}</td>
                                        <td className="px-6 py-4 text-dark-400">{e.description}</td>
                                        <td className="px-6 py-4"><button onClick={() => deleteExpense(e._id)} className="text-red-400 text-xs">Delete</button></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showPayForm && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-6">Record Payment</h3>
                        <form onSubmit={submitPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Event *</label>
                                <select required value={payForm.event} onChange={(e) => handleEventSelect(e.target.value)} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm">
                                    <option value="">Select event</option>
                                    {events.map((ev) => <option key={ev._id} value={ev._id}>{ev.eventType} — {ev.client?.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm text-dark-400 mb-1">Amount *</label><input type="number" required min="1" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" /></div>
                                <div><label className="block text-sm text-dark-400 mb-1">Method</label><select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm">{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium rounded-xl text-sm">Save</button>
                                <button type="button" onClick={() => setShowPayForm(false)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showExpForm && (
                <div className="fixed inset-0 z-50 modal-overlay flex items-center justify-center p-4">
                    <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-dark-100 mb-6">Add Expense</h3>
                        <form onSubmit={submitExpense} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm text-dark-400 mb-1">Category *</label><select required value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm">{EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
                                <div><label className="block text-sm text-dark-400 mb-1">Amount *</label><input type="number" required min="1" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" /></div>
                            </div>
                            <div><label className="block text-sm text-dark-400 mb-1">Date</label><input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" /></div>
                            <div><label className="block text-sm text-dark-400 mb-1">Description</label><input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-200 text-sm" /></div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium rounded-xl text-sm">Save</button>
                                <button type="button" onClick={() => setShowExpForm(false)} className="px-6 py-2.5 bg-dark-800 text-dark-400 rounded-xl text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
