const express = require('express');
const Client = require('../models/Client');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Get all clients (filtered by user)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const filter = { user: req.user.id };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const clients = await Client.find(filter).sort({ createdAt: -1 });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single client with history (ensure ownership)
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
        if (!client) return res.status(404).json({ message: 'Client not found.' });

        const events = await Event.find({ client: client._id }).sort({ date: -1 });
        const payments = await Payment.find({ client: client._id })
            .populate('event', 'eventType date')
            .sort({ date: -1 });

        const totalBookings = events.length;
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalCost = events.reduce((sum, e) => sum + e.packageCost, 0);
        const pendingBalance = totalCost - totalPaid;

        res.json({
            client,
            events,
            payments,
            stats: { totalBookings, totalPaid, totalCost, pendingBalance },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create client (assign to user)
router.post('/', async (req, res) => {
    try {
        const clientData = { ...req.body, user: req.user.id };
        const client = await Client.create(clientData);
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update client (ensure ownership)
router.put('/:id', async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!client) return res.status(404).json({ message: 'Client not found.' });
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete client (ensure ownership)
router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!client) return res.status(404).json({ message: 'Client not found.' });
        res.json({ message: 'Client deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
