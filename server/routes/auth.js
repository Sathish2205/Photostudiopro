const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const user = await User.create({ name, email, password });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Change password
router.put('/password', require('../middleware/auth'), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!await user.comparePassword(currentPassword)) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
    res.json(req.user);
});

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Get all users (Admin only)
router.get('/users', require('../middleware/auth'), checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new user (Admin only)
// Create new user (Admin only)
router.post('/users', require('../middleware/auth'), checkAdmin, async (req, res) => {
    try {
        console.log('Creating user:', req.body);
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Email exists:', email);
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({ name, email, password, role: role || 'admin' });
        console.log('User created:', user._id);

        res.status(201).json({
            message: 'User created successfully',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Reset user password (Admin only)
router.put('/users/:id/password', require('../middleware/auth'), checkAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();

        res.json({ message: `Password for ${user.name} reset successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
