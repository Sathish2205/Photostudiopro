import { useState, useEffect } from 'react';
import api from '../api';
import { User, Phone, MapPin, Camera, Film, FileText } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
    const [current, setCurrent] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selected, setSelected] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);

    const month = current.getMonth();
    const year = current.getFullYear();

    useEffect(() => {
        api.get('/events/calendar', { params: { month: month + 1, year } })
            .then((res) => setEvents(res.data))
            .catch(console.error);
    }, [month, year]);

    const prev = () => setCurrent(new Date(year, month - 1, 1));
    const next = () => setCurrent(new Date(year, month + 1, 1));
    const today = () => setCurrent(new Date());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getEventsForDay = (day) => {
        return events.filter((e) => {
            const d = new Date(e.date);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const handleDayClick = (day) => {
        setSelected(day);
        setDayEvents(getEventsForDay(day));
    };

    const isToday = (day) => {
        const t = new Date();
        return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
    };

    const statusColor = {
        'Booked': 'bg-studio-500',
        'In Progress': 'bg-orange-500',
        'Completed': 'bg-green-500',
        'Delivered': 'bg-purple-500',
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold gradient-text">Calendar</h2>
                <p className="text-dark-500 text-sm">View your monthly schedule</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 glass rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-dark-100">{MONTHS[month]} {year}</h3>
                        <div className="flex gap-2">
                            <button onClick={prev} className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-dark-200 transition-colors">◀</button>
                            <button onClick={today} className="px-3 py-1.5 text-xs bg-studio-600/20 text-studio-300 rounded-lg hover:bg-studio-600/30 transition-colors font-medium">Today</button>
                            <button onClick={next} className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-dark-200 transition-colors">▶</button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((d) => (
                            <div key={d} className="text-center text-xs font-medium text-dark-500 py-2">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-${i}`} className="h-20 rounded-xl" />
                        ))}
                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dayEvs = getEventsForDay(day);
                            const active = selected === day;
                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`h-20 rounded-xl p-2 cursor-pointer transition-all border ${active
                                        ? 'border-studio-500 bg-studio-600/10'
                                        : isToday(day)
                                            ? 'border-studio-500/30 bg-dark-800/50'
                                            : 'border-transparent hover:bg-dark-800/50'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${isToday(day) ? 'text-studio-400' : 'text-dark-300'}`}>{day}</span>
                                    <div className="mt-1 space-y-0.5">
                                        {dayEvs.slice(0, 2).map((ev) => (
                                            <div key={ev._id} className={`${statusColor[ev.status] || 'bg-dark-600'} text-white text-[10px] px-1.5 py-0.5 rounded truncate`}>
                                                {ev.eventType}
                                            </div>
                                        ))}
                                        {dayEvs.length > 2 && (
                                            <div className="text-dark-500 text-[10px]">+{dayEvs.length - 2} more</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Event details panel */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-dark-200 mb-4">
                        {selected ? `${MONTHS[month]} ${selected}, ${year}` : 'Select a date'}
                    </h3>
                    {!selected ? (
                        <p className="text-dark-500 text-sm">Click on a date to see event details.</p>
                    ) : dayEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-dark-500 text-sm">No events on this date.</p>
                            <p className="text-dark-600 text-xs mt-1">This date is available for booking.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dayEvents.map((ev) => (
                                <div key={ev._id} className="bg-dark-800/50 rounded-xl p-4 border border-dark-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-dark-200">{ev.eventType}</span>
                                        <span className={`${statusColor[ev.status] || 'bg-dark-600'} text-white text-xs px-2 py-0.5 rounded-full`}>{ev.status}</span>
                                    </div>
                                    <div className="space-y-2 text-xs text-dark-400">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-studio-400" />
                                            <span>{ev.client?.name || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-studio-400" />
                                            <span>{ev.client?.phone || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-studio-400" />
                                            <span>{ev.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Camera size={14} className="text-studio-400" />
                                            <span>{ev.photographer || 'No Photographer'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Film size={14} className="text-studio-400" />
                                            <span>{ev.editingStatus}</span>
                                        </div>
                                        {ev.notes && (
                                            <div className="flex items-start gap-2">
                                                <FileText size={14} className="text-studio-400 mt-0.5" />
                                                <span>{ev.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
