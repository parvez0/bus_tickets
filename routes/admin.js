const express = require('express');
const router = express.Router();

const { addUser, resetTickets, fetchAllBookingsByBus } = require('../models/admin');

router.post('/add-user', async (req, res) => {
    try {
        const { fullName, email, number, isAdmin, password } = req.body;
        if (!fullName || !email || !number || !isAdmin || !password) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        return res.publish(true, 'Success', { user: await addUser(req.body) }, 201);
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

router.post('/reset-tickets', async (req, res) => {
    try {
        const { busNumber } = req.body;
        if (!busNumber) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        await resetTickets(req.body);
        return res.publish(true, 'Success', { }, 200);
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

router.get('/bookings-by-bus/:busNumber', async (req, res) => {
    try {
        const { busNumber } = req.params;
        if (!busNumber) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        const bookings = await fetchAllBookingsByBus({ busNumber });
        return res.publish(true, 'Success', { bookings }, 200);
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

module.exports = router;
