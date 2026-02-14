import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    CalendarClock,
    BarChart3,
    ListChecks,
    CalendarDays,
    IndianRupee,
    PieChart,
    Receipt,
    Bell,
    Clock,
    Camera,
    Calendar,
    Hourglass,
    TrendingUp,
    Plus,
    UserPlus,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Edit,
    PlusCircle,
    CreditCard
} from 'lucide-react';

const COLORS = ['#5c7cfa', '#748ffc', '#91a7ff', '#f59f00', '#ff6b6b', '#51cf66', '#cc5de8'];
const STATUS_COLORS = { Booked: '#5c7cfa', 'In Progress': '#f59f00', Completed: '#51cf66', Delivered: '#cc5de8' };
const PAY_COLORS = { paid: '#51cf66', advance: '#f59f00', pending: '#ff6b6b' };



function StatCard({ title, value, icon: Icon, color, sub }) {
    return (
        <div className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="text-dark-500 text-xs font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-dark-100 mt-1">{value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            {sub && <p className="text-xs text-dark-500">{sub}</p>}
        </div>
    );
}

function SectionHeader({ title, icon: Icon }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="text-studio-400">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-semibold text-dark-200">{title}</h3>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/finance/dashboard')
            .then((res) => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-studio-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return <p className="text-dark-500">Failed to load dashboard data.</p>;

    const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const pct = (curr, prev) => {
        if (!prev) return curr > 0 ? '+100%' : '0%';
        const change = ((curr - prev) / prev * 100).toFixed(0);
        return (change >= 0 ? '+' : '') + change + '%';
    };

    const mp = stats.monthlyPerformance;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold gradient-text mb-1">Dashboard</h2>
                    <p className="text-dark-500 text-sm">Welcome back — here's your studio at a glance.</p>
                </div>
                <p className="text-dark-500 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* ─── Quick Actions ─── */}
            <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/events')} className="px-4 py-2 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium text-sm rounded-xl hover:from-studio-500 hover:to-studio-400 transition-all shadow-lg shadow-studio-500/20 flex items-center gap-2">
                    <Plus size={16} /> Add Event
                </button>
                <button onClick={() => navigate('/finance')} className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium text-sm rounded-xl hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2">
                    <IndianRupee size={16} /> Add Payment
                </button>
                <button onClick={() => navigate('/clients')} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium text-sm rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    <UserPlus size={16} /> Add Client
                </button>
                <button onClick={() => navigate('/finance')} className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-medium text-sm rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2">
                    <TrendingDown size={16} /> Add Expense
                </button>
            </div>

            {/* ─── Summary Cards ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={Camera} color="bg-studio-600/20 text-studio-400" />
                <StatCard title="Upcoming Events" value={stats.upcomingEvents} icon={Calendar} color="bg-blue-600/20 text-blue-400" />
                <StatCard title="Total Revenue" value={fmt(stats.totalRevenue)} icon={IndianRupee} color="bg-green-600/20 text-green-400" />
                <StatCard title="Pending Payments" value={fmt(stats.pendingPayments)} icon={Hourglass} color="bg-orange-600/20 text-orange-400" />
                <StatCard title="Net Profit" value={fmt(stats.netProfit)} icon={TrendingUp} color="bg-purple-600/20 text-purple-400" sub={`Income ${fmt(stats.totalPaid)} − Expense ${fmt(stats.totalExpenses)}`} />
            </div>

            {/* ─── Monthly Performance Snapshot ─── */}
            <div className="glass rounded-2xl p-5">
                <SectionHeader title="Monthly Performance Snapshot" icon={BarChart3} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Bookings', curr: mp.thisMonth.bookings, prev: mp.lastMonth.bookings, isCurrency: false },
                        { label: 'Revenue', curr: mp.thisMonth.revenue, prev: mp.lastMonth.revenue, isCurrency: true },
                        { label: 'Expenses', curr: mp.thisMonth.expenses, prev: mp.lastMonth.expenses, isCurrency: true },
                        { label: 'Profit', curr: mp.thisMonth.profit, prev: mp.lastMonth.profit, isCurrency: true },
                    ].map(({ label, curr, prev, isCurrency }) => {
                        const change = pct(curr, prev);
                        const isUp = change.startsWith('+');
                        return (
                            <div key={label} className="bg-dark-800/50 rounded-xl p-4">
                                <p className="text-dark-500 text-xs mb-1">{label}</p>
                                <p className="text-xl font-bold text-dark-100">{isCurrency ? fmt(curr) : curr}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className={`text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
                                    <span className="text-dark-600 text-xs">vs last month</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ─── Today's Schedule + Event Status ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 glass rounded-2xl p-5">
                    <SectionHeader title="Today's Schedule" icon={CalendarClock} />
                    {stats.todayEvents.length === 0 ? (
                        <div className="text-dark-500 text-sm py-6 text-center">No events scheduled for today 🎉</div>
                    ) : (
                        <div className="space-y-3">
                            {stats.todayEvents.map((ev) => (
                                <div key={ev._id} className="flex items-center gap-4 bg-dark-800/50 rounded-xl p-4 hover:bg-dark-800/70 transition-colors">
                                    <div className="w-2 h-12 rounded-full" style={{ background: STATUS_COLORS[ev.status] || '#5c7cfa' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-dark-200 font-medium text-sm">{ev.eventType}</p>
                                        <p className="text-dark-500 text-xs">{ev.client?.name || '—'} • {ev.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: STATUS_COLORS[ev.status] + '22', color: STATUS_COLORS[ev.status] }}>{ev.status}</span>
                                        {ev.photographer && <p className="text-dark-500 text-xs mt-1 flex items-center justify-end gap-1"><Camera size={12} /> {ev.photographer}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Event Status Tracker */}
                <div className="glass rounded-2xl p-5">
                    <SectionHeader title="Event Status Tracker" icon={ListChecks} />
                    <div className="space-y-3">
                        {Object.entries(stats.statusCounts).map(([status, count]) => {
                            const total = stats.totalBookings || 1;
                            const perc = Math.round((count / total) * 100);
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-dark-300 text-sm">{status}</span>
                                        <span className="text-dark-400 text-xs font-medium">{count} ({perc}%)</span>
                                    </div>
                                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${perc}%`, background: STATUS_COLORS[status] }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Delivery Tracker */}
                    <div className="mt-5 pt-4 border-t border-dark-700/50">
                        <p className="text-dark-400 text-xs font-medium mb-3 uppercase tracking-wider">Delivery Tracker</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-dark-800/50 rounded-lg p-2">
                                <p className="text-lg font-bold text-yellow-400">{stats.deliveryTracker.inProgress}</p>
                                <p className="text-dark-500 text-[10px]">In Progress</p>
                            </div>
                            <div className="bg-dark-800/50 rounded-lg p-2">
                                <p className="text-lg font-bold text-green-400">{stats.deliveryTracker.pendingDelivery}</p>
                                <p className="text-dark-500 text-[10px]">Ready</p>
                            </div>
                            <div className="bg-dark-800/50 rounded-lg p-2">
                                <p className="text-lg font-bold text-purple-400">{stats.deliveryTracker.delivered}</p>
                                <p className="text-dark-500 text-[10px]">Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Upcoming Events ─── */}
            <div className="glass rounded-2xl p-5">
                <SectionHeader title="Upcoming Events" icon={CalendarDays} />
                {stats.upcomingEventsList.length === 0 ? (
                    <div className="text-dark-500 text-sm py-4 text-center">No upcoming events</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-dark-700/50 text-dark-500 text-left">
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Client</th>
                                    <th className="px-4 py-3 font-medium">Package</th>
                                    <th className="px-4 py-3 font-medium">Cost</th>
                                    <th className="px-4 py-3 font-medium">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.upcomingEventsList.map((ev) => (
                                    <tr key={ev._id} className="border-b border-dark-700/30 hover:bg-dark-800/40 transition-colors">
                                        <td className="px-4 py-3 text-dark-200">{fmtDate(ev.date)}</td>
                                        <td className="px-4 py-3 text-dark-300">{ev.eventType}</td>
                                        <td className="px-4 py-3 text-dark-200">{ev.client?.name || '—'}</td>
                                        <td className="px-4 py-3 text-dark-400">{ev.packageSelected || '—'}</td>
                                        <td className="px-4 py-3 text-dark-200">{fmt(ev.packageCost)}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                                <span className="w-2 h-2 rounded-full" style={{ background: PAY_COLORS[ev.paymentStatus] }} />
                                                {ev.paymentStatus === 'paid' ? 'Paid' : ev.paymentStatus === 'advance' ? 'Advance Paid' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── Charts Row ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Overview */}
                <div className="glass rounded-2xl p-5">
                    <SectionHeader title="Revenue Overview" icon={IndianRupee} />
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                                <XAxis dataKey="month" tick={{ fill: '#8b949e', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, color: '#e6edf3' }} />
                                <Bar dataKey="income" name="Income" fill="#51cf66" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expense" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
                                <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Event Type Distribution */}
                <div className="glass rounded-2xl p-5">
                    <SectionHeader title="Top Event Types" icon={PieChart} />
                    <div className="h-72">
                        {stats.eventDistribution.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-dark-500 text-sm">No events yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie data={stats.eventDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                                        {stats.eventDistribution.map((entry, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, color: '#e6edf3' }} />
                                    <Legend wrapperStyle={{ color: '#8b949e', fontSize: 12 }} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Expense Summary + Payment Alerts ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Summary */}
                <div className="glass rounded-2xl p-5">
                    <SectionHeader title="Expense Summary" icon={Receipt} />
                    {stats.expenseSummary.length === 0 ? (
                        <div className="text-dark-500 text-sm py-4 text-center">No expenses recorded</div>
                    ) : (
                        <div className="space-y-3">
                            {stats.expenseSummary.sort((a, b) => b.amount - a.amount).map(({ category, amount }) => {
                                const totalExp = stats.totalExpenses || 1;
                                const perc = Math.round((amount / totalExp) * 100);
                                return (
                                    <div key={category}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-dark-300 text-sm">{category}</span>
                                            <span className="text-dark-200 text-sm font-medium">{fmt(amount)} <span className="text-dark-500 text-xs">({perc}%)</span></span>
                                        </div>
                                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" style={{ width: `${perc}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-2 border-t border-dark-700/50 flex justify-between">
                                <span className="text-dark-400 text-sm font-medium">Total</span>
                                <span className="text-dark-100 text-sm font-bold">{fmt(stats.totalExpenses)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Alerts */}
                <div className="glass rounded-2xl p-5">
                    <SectionHeader title="Payment Alerts" icon={Bell} />
                    {stats.paymentAlerts.length === 0 ? (
                        <div className="text-dark-500 text-sm py-4 text-center">No pending payments 🎉</div>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {stats.paymentAlerts.map((alert, i) => (
                                <div key={i} className="flex items-center gap-3 bg-dark-800/50 rounded-xl p-3 hover:bg-dark-800/70 transition-colors">
                                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500"><AlertCircle size={16} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-dark-200 text-sm font-medium truncate">{alert.name}</p>
                                        <p className="text-dark-500 text-xs">{alert.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-red-400 text-sm font-bold">{fmt(alert.pending)}</p>
                                        <p className="text-dark-500 text-[10px]">pending</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Recent Activity ─── */}
            <div className="glass rounded-2xl p-5">
                <SectionHeader title="Recent Activity" icon={Clock} />
                {stats.recentActivity.length === 0 ? (
                    <div className="text-dark-500 text-sm py-4 text-center">No recent activity</div>
                ) : (
                    <div className="space-y-2">
                        {stats.recentActivity.map((item, i) => {
                            const icons = { event: Camera, payment: IndianRupee, expense: Receipt };
                            const colors = { event: 'border-studio-500', payment: 'border-green-500', expense: 'border-orange-500' };
                            const Icon = icons[item.type];
                            return (
                                <div key={i} className={`flex items-center gap-3 p-3 bg-dark-800/30 rounded-xl border-l-2 ${colors[item.type]}`}>
                                    <span className="text-dark-400"><Icon size={16} /></span>
                                    <p className="text-dark-300 text-sm flex-1">{item.text}</p>
                                    <span className="text-dark-600 text-xs whitespace-nowrap">{fmtDate(item.date)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
