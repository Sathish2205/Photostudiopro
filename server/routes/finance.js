const express = require('express');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Event = require('../models/Event');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ─── Dashboard Stats (filtered by user) ───
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // --- Core data ---
        const allEvents = await Event.find({ user: userId }).populate('client', 'name phone email');
        const allPayments = await Payment.find({ user: userId }).populate('client', 'name phone').populate('event', 'eventType date');
        const allExpenses = await Expense.find({ user: userId });
        const allClients = await Client.find({ user: userId });

        const totalRevenue = allEvents.reduce((sum, e) => sum + e.packageCost, 0);
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = totalRevenue - totalPaid;
        const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalPaid - totalExpenses;

        // --- 1. Today's Schedule ---
        const todayEvents = allEvents
            .filter(e => {
                const d = new Date(e.date);
                return d >= startOfToday && d <= endOfToday;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // --- 2. Upcoming Events (next 10) ---
        const upcomingEventsList = allEvents
            .filter(e => new Date(e.date) > endOfToday)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 10)
            .map(e => {
                const eventPayments = allPayments.filter(p => p.event && p.event._id.toString() === e._id.toString());
                const paid = eventPayments.reduce((s, p) => s + p.amount, 0);
                let paymentStatus = 'pending';
                if (paid >= e.packageCost) paymentStatus = 'paid';
                else if (paid > 0) paymentStatus = 'advance';
                return { ...e.toJSON(), paidAmount: paid, paymentStatus };
            });

        // --- 3. Monthly Revenue (last 6 months) ---
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const monthPayments = allPayments.filter(p => p.date >= mStart && p.date <= mEnd);
            const monthExpenses = allExpenses.filter(e => e.date >= mStart && e.date <= mEnd);
            const income = monthPayments.reduce((sum, p) => sum + p.amount, 0);
            const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            monthlyRevenue.push({
                month: mStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
                income,
                expense,
                profit: income - expense,
            });
        }

        // --- 4. Expense Summary by Category ---
        const expenseByCategory = {};
        allExpenses.forEach(e => {
            expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
        });
        const expenseSummary = Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount }));

        // --- 5. Payment Alerts ---
        const clientBalances = {};
        allEvents.forEach(e => {
            const cId = e.client?._id?.toString();
            if (!cId) return;
            if (!clientBalances[cId]) clientBalances[cId] = { name: e.client.name, phone: e.client.phone, totalCost: 0, totalPaid: 0 };
            clientBalances[cId].totalCost += e.packageCost;
        });
        allPayments.forEach(p => {
            const cId = p.client?._id?.toString();
            if (!cId || !clientBalances[cId]) return;
            clientBalances[cId].totalPaid += p.amount;
        });
        const paymentAlerts = Object.values(clientBalances)
            .filter(c => c.totalCost - c.totalPaid > 0)
            .map(c => ({ ...c, pending: c.totalCost - c.totalPaid }))
            .sort((a, b) => b.pending - a.pending);

        // --- 6. Event Status Tracker ---
        const statusCounts = { Booked: 0, 'In Progress': 0, Completed: 0, Delivered: 0 };
        allEvents.forEach(e => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });

        // --- 7. Recent Activity (last 10 actions) ---
        const recentActivity = [];
        allEvents.slice(-10).forEach(e => recentActivity.push({
            type: 'event', text: `New booking: ${e.eventType} for ${e.client?.name || 'Unknown'}`, date: e.createdAt,
        }));
        allPayments.slice(-10).forEach(p => recentActivity.push({
            type: 'payment', text: `Payment ₹${p.amount.toLocaleString('en-IN')} from ${p.client?.name || 'Unknown'}`, date: p.createdAt,
        }));
        allExpenses.slice(-10).forEach(e => recentActivity.push({
            type: 'expense', text: `Expense ₹${e.amount.toLocaleString('en-IN')} — ${e.category}`, date: e.createdAt,
        }));
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivityList = recentActivity.slice(0, 10);

        // --- 8. Event Type Distribution (pie) ---
        const eventTypeCounts = {};
        allEvents.forEach(e => { eventTypeCounts[e.eventType] = (eventTypeCounts[e.eventType] || 0) + 1; });
        const eventDistribution = Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value }));

        // --- 9. Monthly Performance Snapshot (this month vs last) ---
        const thisMonthEvents = allEvents.filter(e => e.date >= startOfMonth && e.date <= endOfMonth);
        const lastMonthEvents = allEvents.filter(e => e.date >= startOfLastMonth && e.date <= endOfLastMonth);
        const thisMonthPayments = allPayments.filter(p => p.date >= startOfMonth && p.date <= endOfMonth);
        const lastMonthPayments = allPayments.filter(p => p.date >= startOfLastMonth && p.date <= endOfLastMonth);
        const thisMonthExpenses = allExpenses.filter(e => e.date >= startOfMonth && e.date <= endOfMonth);
        const lastMonthExpenses = allExpenses.filter(e => e.date >= startOfLastMonth && e.date <= endOfLastMonth);

        const thisMonthIncome = thisMonthPayments.reduce((s, p) => s + p.amount, 0);
        const lastMonthIncome = lastMonthPayments.reduce((s, p) => s + p.amount, 0);
        const thisMonthExp = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
        const lastMonthExp = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);

        const monthlyPerformance = {
            thisMonth: {
                bookings: thisMonthEvents.length,
                revenue: thisMonthIncome,
                expenses: thisMonthExp,
                profit: thisMonthIncome - thisMonthExp,
            },
            lastMonth: {
                bookings: lastMonthEvents.length,
                revenue: lastMonthIncome,
                expenses: lastMonthExp,
                profit: lastMonthIncome - lastMonthExp,
            },
        };

        // --- 10. Delivery Tracker ---
        const deliveryTracker = {
            pendingDelivery: allEvents.filter(e => e.status === 'Completed').length,
            inProgress: allEvents.filter(e => e.status === 'In Progress').length,
            delivered: allEvents.filter(e => e.status === 'Delivered').length,
        };

        res.json({
            totalRevenue,
            pendingPayments,
            totalExpenses,
            netProfit,
            totalPaid,
            totalBookings: allEvents.length,
            totalClients: allClients.length,
            upcomingEvents: allEvents.filter(e => new Date(e.date) >= now).length,
            todayEvents,
            upcomingEventsList,
            monthlyRevenue,
            expenseSummary,
            paymentAlerts,
            statusCounts,
            recentActivity: recentActivityList,
            eventDistribution,
            monthlyPerformance,
            deliveryTracker,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── Payments (filtered by user) ───
router.get('/payments', async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .populate('event', 'eventType date packageCost')
            .populate('client', 'name phone')
            .sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/payments', async (req, res) => {
    try {
        const paymentData = { ...req.body, user: req.user.id };
        const payment = await Payment.create(paymentData);

        // Update advance paid on the event
        const event = await Event.findOne({ _id: req.body.event, user: req.user.id });
        if (event) {
            event.advancePaid += req.body.amount;
            await event.save();
        }

        const populated = await payment.populate([
            { path: 'event', select: 'eventType date packageCost' },
            { path: 'client', select: 'name phone' },
        ]);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/payments/:id', async (req, res) => {
    try {
        const payment = await Payment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!payment) return res.status(404).json({ message: 'Payment not found.' });
        res.json({ message: 'Payment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── Expenses (filtered by user) ───
router.get('/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/expenses', async (req, res) => {
    try {
        const expenseData = { ...req.body, user: req.user.id };
        const expense = await Expense.create(expenseData);
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/expenses/:id', async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!expense) return res.status(404).json({ message: 'Expense not found.' });
        res.json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
