const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        required: true,
<<<<<<< HEAD
        enum: ['Equipment', 'Travel', 'Editing', 'Staff Payment', 'Rent','Print', 'Marketing', 'Other'],
=======
        enum: ['Equipment', 'Travel', 'Editing', 'Staff Payment', 'Rent', 'Print', 'Marketing', 'Other'],
>>>>>>> 41ecd30 (Fix Print expense category issue)
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
