require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');
const Event = require('./models/Event');
const Payment = require('./models/Payment');
const Expense = require('./models/Expense');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or find Admin
    let admin = await User.findOne({ email: 'admin@studio.com' });
    if (!admin) {
        admin = await User.create({
            name: 'Admin',
            email: 'admin@studio.com',
            password: 'admin123',
            role: 'admin',
        });
        console.log('✅ Admin user created: admin@studio.com / admin123');
    } else {
        console.log('Admin user already exists.');
    }

    // Create or find User2
    let user2 = await User.findOne({ email: 'user2@studio.com' });
    if (!user2) {
        user2 = await User.create({
            name: 'User Two',
            email: 'user2@studio.com',
            password: 'user123',
            role: 'staff',
        });
        console.log('✅ User2 created: user2@studio.com / user123');
    } else {
        console.log('User2 already exists.');
    }

    // Clear existing data
    await Client.deleteMany({});
    await Event.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});
    console.log('Cleared existing clients, events, payments, and expenses.');

    // ─── Admin Data ───
    const [adminClient1, adminClient2] = await Client.create([
        { user: admin._id, name: 'Alice AdminClient', phone: '111-111-1111', email: 'alice@test.com' },
        { user: admin._id, name: 'Bob AdminClient', phone: '222-222-2222', email: 'bob@test.com' },
    ]);
    console.log('✅ Created clients for Admin.');

    const [adminEvent1] = await Event.create([
        {
            user: admin._id,
            client: adminClient1._id,
            eventType: 'Wedding',
            date: new Date('2026-03-15'),
            location: 'Grand Hotel',
            packageSelected: 'Premium',
            packageCost: 50000,
            advancePaid: 20000,
            status: 'Booked',
        },
        {
            user: admin._id,
            client: adminClient2._id,
            eventType: 'Birthday',
            date: new Date('2026-03-20'),
            location: 'City Park',
            packageSelected: 'Basic',
            packageCost: 15000,
            advancePaid: 5000,
            status: 'Booked',
        },
    ]);
    console.log('✅ Created events for Admin.');

    await Payment.create([
        { user: admin._id, event: adminEvent1._id, client: adminClient1._id, amount: 20000, method: 'UPI' },
    ]);
    console.log('✅ Created payments for Admin.');

    await Expense.create([
        { user: admin._id, category: 'Equipment', amount: 5000, description: 'New lens' },
    ]);
    console.log('✅ Created expenses for Admin.');

    // ─── User2 Data ───
    const [user2Client1, user2Client2] = await Client.create([
        { user: user2._id, name: 'Charlie User2Client', phone: '333-333-3333', email: 'charlie@test.com' },
        { user: user2._id, name: 'Dave User2Client', phone: '444-444-4444', email: 'dave@test.com' },
    ]);
    console.log('✅ Created clients for User2.');

    const [user2Event1] = await Event.create([
        {
            user: user2._id,
            client: user2Client1._id,
            eventType: 'Corporate',
            date: new Date('2026-03-18'),
            location: 'Tech Park Auditorium',
            packageSelected: 'Standard',
            packageCost: 30000,
            advancePaid: 10000,
            status: 'Booked',
        },
    ]);
    console.log('✅ Created events for User2.');

    await Payment.create([
        { user: user2._id, event: user2Event1._id, client: user2Client1._id, amount: 10000, method: 'Cash' },
    ]);
    console.log('✅ Created payments for User2.');

    await Expense.create([
        { user: user2._id, category: 'Travel', amount: 2000, description: 'Client location visit' },
    ]);
    console.log('✅ Created expenses for User2.');

    await mongoose.disconnect();
    console.log('Done!');
}

seed().catch(console.error);
