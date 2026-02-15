const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

const router = express.Router();
router.use(auth);

// Get all events (filtered by user, with optional filters)
router.get('/', async (req, res) => {
    try {
        const { status, eventType, month, year } = req.query;
        const filter = { user: req.user.id };

        if (status) filter.status = status;
        if (eventType) filter.eventType = eventType;

        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        }

        const events = await Event.find(filter)
            .populate('client', 'name phone email')
            .sort({ date: -1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get upcoming events (filtered by user)
router.get('/upcoming', async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id, date: { $gte: new Date() } })
            .populate('client', 'name phone email')
            .sort({ date: 1 })
            .limit(10);

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get calendar data for a month (filtered by user)
router.get('/calendar', async (req, res) => {
    try {
        const { month, year } = req.query;
        const m = parseInt(month) || new Date().getMonth() + 1;
        const y = parseInt(year) || new Date().getFullYear();

        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);

        const events = await Event.find({ user: req.user.id, date: { $gte: start, $lte: end } })
            .populate('client', 'name phone')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single event (ensure ownership)
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, user: req.user.id }).populate('client');
        if (!event) return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create event (assign to user, multiple bookings per date allowed)
router.post('/', async (req, res) => {
    try {
        const eventData = { ...req.body, user: req.user.id };
        const event = await Event.create(eventData);

        // Create a Payment record if advance is paid
        const advanceAmount = Number(event.advancePaid) || 0;
        if (advanceAmount > 0) {
            try {
                await Payment.create({
                    user: req.user.id,
                    event: event._id,
                    client: event.client,
                    amount: advanceAmount,
                    method: req.body.advanceMethod || 'Cash',
                    date: new Date(),
                    notes: 'Advance payment on booking',
                });
            } catch (payErr) {
                console.error('Failed to create advance payment record:', payErr.message);
            }
        }

        const populated = await event.populate('client', 'name phone email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update event (ensure ownership, no double-booking restriction)
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        ).populate('client', 'name phone email');

        if (!event) return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update event status (ensure ownership)
router.patch('/:id/status', async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status: req.body.status },
            { new: true, runValidators: true }
        ).populate('client', 'name phone email');

        if (!event) return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update editing workflow status (ensure ownership)
router.patch('/:id/editing-status', async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { editingStatus: req.body.editingStatus },
            { new: true, runValidators: true }
        ).populate('client', 'name phone email');

        if (!event) return res.status(404).json({ message: 'Event not found.' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete event (ensure ownership)
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!event) return res.status(404).json({ message: 'Event not found.' });
        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
