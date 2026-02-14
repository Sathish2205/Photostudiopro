const express = require('express');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function toCSV(headers, rows) {
    const headerLine = headers.join(',');
    const dataLines = rows.map((row) =>
        headers.map((h) => {
            const val = row[h] !== undefined ? String(row[h]) : '';
            return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headerLine, ...dataLines].join('\n');
}

// Monthly finance report (filtered by user)
router.get('/finance', async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;
        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);

        const payments = await Payment.find({ user: userId, date: { $gte: start, $lte: end } })
            .populate('client', 'name')
            .populate('event', 'eventType');

        const expenses = await Expense.find({ user: userId, date: { $gte: start, $lte: end } });

        const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
        const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

        const paymentRows = payments.map((p) => ({
            Date: new Date(p.date).toLocaleDateString(),
            Client: p.client?.name || '',
            'Event Type': p.event?.eventType || '',
            Amount: p.amount,
            Method: p.method,
        }));

        const expenseRows = expenses.map((e) => ({
            Date: new Date(e.date).toLocaleDateString(),
            Category: e.category,
            Amount: e.amount,
            Description: e.description,
        }));

        const csv =
            `MONTHLY FINANCE REPORT - ${m}/${y}\n\n` +
            `PAYMENTS\n` +
            toCSV(['Date', 'Client', 'Event Type', 'Amount', 'Method'], paymentRows) +
            `\n\nTotal Income: ${totalIncome}\n\n` +
            `EXPENSES\n` +
            toCSV(['Date', 'Category', 'Amount', 'Description'], expenseRows) +
            `\n\nTotal Expenses: ${totalExpense}\n` +
            `Net Profit: ${totalIncome - totalExpense}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=finance-report-${m}-${y}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Event report (filtered by user)
router.get('/events', async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;
        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);

        const events = await Event.find({ user: userId, date: { $gte: start, $lte: end } })
            .populate('client', 'name phone');

        const rows = events.map((e) => ({
            Date: new Date(e.date).toLocaleDateString(),
            Client: e.client?.name || '',
            Phone: e.client?.phone || '',
            'Event Type': e.eventType,
            Location: e.location,
            Package: e.packageSelected,
            Cost: e.packageCost,
            Advance: e.advancePaid,
            Balance: e.packageCost - e.advancePaid,
            Status: e.status,
        }));

        const csv = toCSV(
            ['Date', 'Client', 'Phone', 'Event Type', 'Location', 'Package', 'Cost', 'Advance', 'Balance', 'Status'],
            rows
        );

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=event-report-${m}-${y}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Client payment report (filtered by user)
router.get('/client-payments', async (req, res) => {
    try {
        const userId = req.user.id;
        const payments = await Payment.find({ user: userId })
            .populate('client', 'name phone')
            .populate('event', 'eventType date packageCost')
            .sort({ date: -1 });

        const rows = payments.map((p) => ({
            Date: new Date(p.date).toLocaleDateString(),
            Client: p.client?.name || '',
            Phone: p.client?.phone || '',
            'Event Type': p.event?.eventType || '',
            'Event Date': p.event?.date ? new Date(p.event.date).toLocaleDateString() : '',
            Amount: p.amount,
            Method: p.method,
        }));

        const csv = toCSV(
            ['Date', 'Client', 'Phone', 'Event Type', 'Event Date', 'Amount', 'Method'],
            rows
        );

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=client-payment-report.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
