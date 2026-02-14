import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

import {
    Circle,
    Camera,
    Scissors,
    CheckCircle2,
    BookOpen,
    PartyPopper,
    HardDrive
} from 'lucide-react';

const EDITING_STAGES = ['Not Started', 'Shoot Completed', 'Editing Started', 'Editing Completed', 'Printing in Progress', 'Delivered'];
const STAGE_CONFIG = {
    'Not Started': { color: '#6b7280', bg: '#6b728020', icon: Circle, step: 0 },
    'Shoot Completed': { color: '#5c7cfa', bg: '#5c7cfa20', icon: Camera, step: 1 },
    'Editing Started': { color: '#f59f00', bg: '#f59f0020', icon: Scissors, step: 2 },
    'Editing Completed': { color: '#51cf66', bg: '#51cf6620', icon: CheckCircle2, step: 3 },
    'Printing in Progress': { color: '#cc5de8', bg: '#cc5de820', icon: BookOpen, step: 4 },
    'Delivered': { color: '#20c997', bg: '#20c99720', icon: PartyPopper, step: 5 },
};

export default function WorkflowPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (eventId, newStatus) => {
        try {
            const res = await api.patch(`/events/${eventId}/editing-status`, { editingStatus: newStatus });
            setEvents(events.map(ev => ev._id === eventId ? res.data : ev));
            toast.success(`Updated to ${newStatus}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // Filtering
    const q = search.toLowerCase();
    const filtered = events.filter(ev => {
        if (filter && ev.editingStatus !== filter) return false;
        if (q && !(
            (ev.client?.name || '').toLowerCase().includes(q) ||
            ev.eventType.toLowerCase().includes(q) ||
            ev.location.toLowerCase().includes(q) ||
            (ev.photographer || '').toLowerCase().includes(q) ||
            (ev.backupLocation || '').toLowerCase().includes(q)
        )) return false;
        return true;
    });

    // Group by status for the summary
    const statusGroups = {};
    EDITING_STAGES.forEach(s => { statusGroups[s] = events.filter(ev => (ev.editingStatus || 'Not Started') === s).length; });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-studio-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold gradient-text mb-1">Editing Workflow Tracker</h2>
                <p className="text-dark-500 text-sm">Track post-production stages for all your events</p>
            </div>

            {/* Stage Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {EDITING_STAGES.map(stage => {
                    const cfg = STAGE_CONFIG[stage];
                    const count = statusGroups[stage];
                    const isActive = filter === stage;
                    return (
                        <button
                            key={stage}
                            onClick={() => setFilter(isActive ? '' : stage)}
                            className={`glass rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${isActive ? 'ring-2' : ''}`}
                            style={isActive ? { ringColor: cfg.color, borderColor: cfg.color } : {}}
                        >
                            <span className="block mb-2 flex justify-center"><cfg.icon size={24} /></span>
                            <p className="text-2xl font-bold" style={{ color: cfg.color }}>{count}</p>
                            <p className="text-dark-500 text-[10px] leading-tight mt-1">{stage}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
                    className="bg-dark-800 border border-dark-700 text-dark-200 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-studio-500/50 min-w-[220px]"
                />
                {filter && (
                    <button onClick={() => setFilter('')} className="px-3 py-2 bg-dark-800 text-dark-400 text-sm rounded-xl hover:text-dark-200 transition-colors">
                        ✕ Clear filter: {filter}
                    </button>
                )}
            </div>

            {/* Events List */}
            {filtered.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <p className="text-dark-500">{events.length === 0 ? 'No events found.' : 'No events match your filter.'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(ev => {
                        const currentStage = ev.editingStatus || 'Not Started';
                        const cfg = STAGE_CONFIG[currentStage] || STAGE_CONFIG['Not Started'];
                        const stepIdx = cfg.step;

                        return (
                            <div key={ev._id} className="glass rounded-2xl p-5 hover:bg-dark-800/30 transition-colors">
                                {/* Top row: event info */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: cfg.bg }}>
                                            <cfg.icon size={20} color={cfg.color} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-dark-200 font-semibold text-sm">{ev.eventType} — {ev.client?.name || '—'}</p>
                                            <p className="text-dark-500 text-xs flex items-center gap-1">{fmt(ev.date)} • {ev.location} {ev.photographer ? <><span className="text-dark-600">•</span> <Camera size={12} /> {ev.photographer}</> : ''}</p>
                                            {ev.backupLocation && <p className="text-dark-500 text-xs mt-0.5 flex items-center gap-1"><HardDrive size={12} /> {ev.backupLocation}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                                            {currentStage}
                                        </span>
                                        <select
                                            value={currentStage}
                                            onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                                            className="bg-dark-800 border border-dark-700 text-xs rounded-lg px-2 py-1.5 text-dark-300 focus:outline-none focus:ring-1 focus:ring-studio-500/50"
                                        >
                                            {EDITING_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Progress pipeline */}
                                <div className="flex items-center gap-1">
                                    {EDITING_STAGES.slice(1).map((stage, i) => {
                                        const sCfg = STAGE_CONFIG[stage];
                                        const isCompleted = stepIdx > i;
                                        const isCurrent = stepIdx === i + 1;
                                        return (
                                            <div key={stage} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div
                                                        className={`h-2 w-full rounded-full transition-all duration-500 ${isCompleted || isCurrent ? '' : 'opacity-20'}`}
                                                        style={{ background: isCompleted || isCurrent ? sCfg.color : '#30363d' }}
                                                    />
                                                    <span className={`text-[9px] mt-1.5 text-center leading-tight ${isCurrent ? 'font-bold' : ''}`} style={{ color: isCompleted || isCurrent ? sCfg.color : '#484f58' }}>
                                                        {stage.replace('Editing ', 'Ed. ')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
