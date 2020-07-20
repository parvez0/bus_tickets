const express = require('express');
const router = express.Router();

const { signup, verifyUser, fetchBuses, fetchSeats } = require('../models/index');

/**
 * sing-up as end user with personalised experience
 */
router.post('/sign-up', async (req, res) => {
    try {
        const { fullName, email, number, password } = req.body;
        if (!fullName || !email || !number || !password) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        const token = await signup(req.body);
        return res.publish(true, 'Login success', { token, type: 'Bearer' }, 201, { name: 'TXID', value: token });
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

/**
 * login user generates auth jwt token
 */
router.post('/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;
        if (!usernameOrEmail || !password) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        const token = await verifyUser(usernameOrEmail, password);
        return res.publish(true, 'Login success', { token, type: 'Bearer' }, 200, { name: 'TXID', value: token });
    } catch (e) {
        return res.publish(false, 'Failed to login', { message: e.message }, e.statusCode());
    }
});

/**
 * fetch available buses list
 */
router.get('/buses', async (req, res) => {
    try {
        const { source, destination } = req.query;
        /* eslint-disable-next-line no-extra-parens */
        if ((source && !destination) || (!source && destination)) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        const buses = await fetchBuses(req.query);
        return res.publish(true, 'Success', { buses });
    } catch (e) {
        return res.publish(false, 'Failed to fetch buses', { message: e.message }, e.statusCode());
    }
});

/**
 * fetch seats based on a bus number or id
 */
router.get('/seats/:busNumber', async (req, res) => {
    try {
        const { busNumber } = req.params;
        if (!busNumber) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        const seats = await fetchSeats({ seatNumber: req.query.seatNumber, busNumber });
        return res.publish(true, 'Success', { seats });
    } catch (e) {
        return res.publish(false, 'Failed to fetch seats', { message: e.message }, e.statusCode());
    }
});

module.exports = router;
