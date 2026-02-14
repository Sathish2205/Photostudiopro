const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const res = await Event.updateMany(
            { editingStatus: 'Album Designing' },
            { $set: { editingStatus: 'Printing in Progress' } }
        );

        console.log(`Updated ${res.modifiedCount} events from 'Album Designing' to 'Printing in Progress'.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit();
    }
}

migrate();
