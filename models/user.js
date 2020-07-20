const { Users, Buses, Seats, Bookings, mongoose } = require('../db-seeds/mongo');

/**
 * @param userId
 * @return {Promise<{}>}
 */
const profile = async (userId) => {
    try {
        const userDetails = await Users.findOne({ _id: userId });
        delete userDetails._doc._id;
        delete userDetails._doc.saltToken;
        delete userDetails._doc.password;
        return userDetails._doc;
    } catch (e) {
        logger.error('Failed to fetch the profile -', e);
        return Promise.reject(new CustomError('Failed to fetch your profile', 500));
    }
};

/**
 * @param seatNumber
 * @param busNumber
 * @param userId
 * @param busId
 * @return {Promise<{}|{[p: string]: *}>}
 */
const bookTicket = async (seatNumber, busNumber, userId, busId) => {
    try {
        const seat = await Seats.findOne({ seatNumber, busNumber });
        if (!seat) {
            return Promise.reject(new CustomError(`There is no seat with number ${seatNumber} for bus ${busNumber}`, 404));
        }
        if (!seat._doc.isAvailable) {
            delete seat._doc._id;
            return seat._doc;
        }
        const booking = new Bookings({ seat: seat._doc._id, bus: busId, user: userId });
        await booking.save();
        seat.isAvailable = false;
        seat.status = 'PENDING';
        seat.updatedDate = Date.now();
        await seat.save();
        delete seat._doc._id;
        const seatObject = { ...seat._doc, ticketId: booking._doc._id };
        return seatObject;
    } catch (e) {
        logger.error(`Failed to fetch seat status for seatNumber - ${seatNumber} and bus - ${busNumber} -`, e);
        return Promise.reject(new CustomError(`Failed to fetch seat status for seat number ${seatNumber}`, 500));
    }
};

/**
 * @param seatNumbers
 * @param busNumber
 * @param userId
 * @return {Promise<{bookedTickets: [], conflictTickets: []}>}
 */
const bookSeats = async ({ seatNumbers, busNumber, userId }) => {
    try {
        const bookedTickets = [];
        const conflictTickets = [];
        const bus = await Buses.findOne({ busNumber });
        if (!bus) {
            return Promise.reject(new CustomError('The bus number provided by you is not present', 404));
        }
        if (bus._doc.availableSeats <= 0) {
            return Promise.reject(new CustomError('Seats are not available for the selected bus', 200));
        }
        for (let i = 0; i < seatNumbers.length; i++) {
            const ticket = await bookTicket(seatNumbers[i], busNumber, userId, bus._doc._id);
            if (ticket.ticketId) {
                bookedTickets.push(ticket);
            } else {
                conflictTickets.push(ticket);
            }
        }
        return { bookedTickets, conflictTickets };
    } catch (e) {
        if (e.statusCode) {
            return Promise.reject(new CustomError(e.message, e.statusCode()));
        }
        logger.error('Failed book the seats -', e);
        return Promise.reject(new CustomError('Something went wrong please try again', 500));
    }
};

/**
 * @param ticketId
 * @return {Promise<*>}
 */
const fetchTicket = async (ticketId) => {
    try {
        const booking = await Bookings.findOne({ _id: ticketId }).populate('seat');
        if (booking) {
            const { seat, _id } = booking._doc;
            delete seat._doc._id;
            return { ticketId: _id, ...seat._doc };
        }
        return Promise.reject(new CustomError(`Ticket with id ${ticketId} not found`, 404));
    } catch (e) {
        logger.error('Failed get the status of the ticket -', e);
        return Promise.reject(new CustomError('Something went wrong please try again', 500));
    }
};

/**
 * @param userId
 * @return {Promise<[]>}
 */
const fetchBookingList = async (userId) => {
    try {
        const bookings = await Bookings.find({ user: mongoose.Types.ObjectId(userId), active: true }).populate('seat');
        if (!bookings || bookings.length <= 0) {
            return Promise.reject(new CustomError('You have not booked any tickets yet', 404));
        }
        const bookedTickets = [];
        for (let i = 0; i < bookings.length; i++) {
            const { _id, seat } = bookings[i]._doc;
            delete seat._doc._id;
            bookedTickets.push({ ...seat._doc, ticketId: _id });
        }
        return bookedTickets;
    } catch (e) {
        logger.error('Failed to get the booking list -', e);
        return Promise.reject(new CustomError('Something went wrong please try again', 500));
    }
};

module.exports = {
    profile,
    bookSeats,
    fetchTicket,
    fetchBookingList
};
