const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    eventType: {
        type: String,
        required: true,
        enum: ['Wedding', 'Birthday', 'Corporate', 'Outdoor Shoot', 'Portrait', 'Product', 'Other'],
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, required: true, trim: true },
    packageSelected: { type: String, trim: true, default: '' },
    packageCost: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    photographer: { type: String, trim: true, default: '' },
    status: {
        type: String,
        enum: ['Booked', 'In Progress', 'Completed', 'Delivered'],
        default: 'Booked',
    },
    editingStatus: {
        type: String,
        enum: ['Not Started', 'Shoot Completed', 'Editing Started', 'Editing Completed', 'Printing in Progress', 'Delivered'],
        default: 'Not Started',
    },
    backupLocation: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },
}, { timestamps: true });

eventSchema.virtual('remainingBalance').get(function () {
    return this.packageCost - this.advancePaid;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
