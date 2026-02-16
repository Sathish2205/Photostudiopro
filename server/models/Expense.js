const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: {
                type: String,
                required: true,
                enum: ['Equipment', 'Travel', 'Editing', 'Staff Payment', 'Rent', 'Print', 'Marketing', 'Other'],
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
