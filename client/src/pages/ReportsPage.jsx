import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ReportsPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [downloading, setDownloading] = useState('');

    const download = async (type, filename) => {
        setDownloading(type);
        try {
            const res = await api.get(`/reports/${type}`, {
                params: { month, year },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Report downloaded!');
        } catch {
            toast.error('Error downloading report');
        } finally {
            setDownloading('');
        }
    };

    const reports = [
        { type: 'finance', label: 'Monthly Finance Report', desc: 'Payments received, expenses, and net profit', icon: '💰', file: `finance-report-${month}-${year}.csv` },
        { type: 'events', label: 'Event Report', desc: 'All events with client, package, cost, and status details', icon: '📸', file: `event-report-${month}-${year}.csv` },
        { type: 'client-payments', label: 'Client Payment Report', desc: 'All client payments with event details', icon: '👥', file: 'client-payment-report.csv' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold gradient-text">Reports</h2>
                <p className="text-dark-500 text-sm">Download monthly reports as CSV</p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-dark-800 border border-dark-700 text-dark-300 text-sm rounded-xl px-4 py-2.5">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2020} max={2030} className="bg-dark-800 border border-dark-700 text-dark-300 text-sm rounded-xl px-4 py-2.5 w-28" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reports.map((r) => (
                    <div key={r.type} className="glass rounded-2xl p-6 flex flex-col">
                        <div className="text-3xl mb-3">{r.icon}</div>
                        <h3 className="text-lg font-semibold text-dark-200 mb-1">{r.label}</h3>
                        <p className="text-dark-500 text-sm flex-1 mb-4">{r.desc}</p>
                        <button
                            onClick={() => download(r.type, r.file)}
                            disabled={downloading === r.type}
                            className="w-full py-2.5 bg-gradient-to-r from-studio-600 to-studio-500 text-white font-medium text-sm rounded-xl hover:from-studio-500 hover:to-studio-400 transition-all disabled:opacity-50"
                        >
                            {downloading === r.type ? 'Downloading...' : '⬇ Download CSV'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
