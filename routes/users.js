const express = require('express');
const router = express.Router();
const { logout } = require('../models/index');
const { profile, bookSeats, fetchTicket, fetchBookingList } = require('../models/user');

/**
 * logout route for the user
 */
router.post('/logout', async (req, res) => {
    try {
        await logout(req.sessionId, req.email);
        return res.publish(true, 'Logout successful', {});
    } catch (e) {
        return res.publish(false, 'Failed to fetch buses', { message: e.message }, e.statusCode());
    }
});


/**
 * fetch current users profile
 */
router.get('/profile', async (req, res) => {
    try {
        return res.publish(true, 'Success', await profile(req.userId));
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

/**
 * book a seat for the user
 * returns ticket id
 */
router.post('/book-tickets', async (req, res) => {
    try {
        const { seatNumbers, busNumber } = req.body;
        if (!seatNumbers || !busNumber) {
            return res.publish(false, 'Request body malformed', { message: 'One or more required parameters not provided' }, 400);
        }
        const { bookedTickets, conflictTickets } = await bookSeats({ seatNumbers, busNumber, userId: req.userId });
        const message = conflictTickets.length > 0
            ? 'There were some tickets which were conflicting so they were not booked'
            : 'Please use the id for checking the status of the booking';
        return res.publish(true, 'Success', { bookedTickets, conflictTickets, message }, 201);
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

/**
 * returns a list of all booked tickets
 * returns Array<Object>
 */
router.get('/booked-tickets', async (req, res) => {
    try {
        return res.publish(true, 'Success', { ticket: await fetchBookingList(req.userId) });
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

/**
 * returns current status of the ticket
 * returns {PENDING| APPROVED| REJECTED}
 */
router.get('/booked-ticket-status/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        return res.publish(true, 'Success', { ticket: await fetchTicket(ticketId) });
    } catch (e) {
        return res.publish(false, 'Failed', { message: e.message }, e.statusCode());
    }
});

module.exports = router;
