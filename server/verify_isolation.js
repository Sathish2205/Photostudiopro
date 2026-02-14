const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const adminRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@studio.com',
            password: 'admin123'
        });
        const adminToken = adminRes.data.token;
        console.log('✅ Admin logged in.');

        // 2. Get Admin Clients
        console.log('Fetching Admin clients...');
        const adminClientsRes = await axios.get(`${API_URL}/clients`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const adminClients = adminClientsRes.data;
        console.log(`✅ Admin has ${adminClients.length} clients.`);
        if (adminClients.some(c => c.email.includes('user2'))) {
            console.error('❌ Admin sees User2 clients!');
        }

        // 3. Login as User2
        console.log('Logging in as User2...');
        const user2Res = await axios.post(`${API_URL}/auth/login`, {
            email: 'user2@studio.com',
            password: 'user123'
        });
        const user2Token = user2Res.data.token;
        console.log('✅ User2 logged in.');

        // 4. Get User2 Clients
        console.log('Fetching User2 clients...');
        const user2ClientsRes = await axios.get(`${API_URL}/clients`, {
            headers: { Authorization: `Bearer ${user2Token}` }
        });
        const user2Clients = user2ClientsRes.data;
        console.log(`✅ User2 has ${user2Clients.length} clients.`);

        if (user2Clients.some(c => c.email.includes('admin'))) {
            console.error('❌ User2 sees Admin clients!');
        }

        // 5. Create Client as User2
        console.log('Creating client as User2...');
        const newClientRes = await axios.post(`${API_URL}/clients`, {
            name: 'New User2 Client',
            phone: '555-555-5555',
            email: 'new_user2@test.com'
        }, {
            headers: { Authorization: `Bearer ${user2Token}` }
        });
        console.log('✅ User2 created client.');

        // 6. Verify Admin cannot see it
        console.log('Verifying Admin cannot see new client...');
        const adminClientsRes2 = await axios.get(`${API_URL}/clients`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const adminClients2 = adminClientsRes2.data;
        if (adminClients2.find(c => c._id === newClientRes.data._id)) {
            console.error('❌ Admin sees the new User2 client!');
        } else {
            console.log('✅ Admin does NOT see the new User2 client.');
        }

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

test();
