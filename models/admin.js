const { Users, Seats, Bookings, Buses, Session } = require('../db-seeds/mongo');

const addUser = async ({ fullName, email, number, password, isAdmin }) => {
    try {
        const isUserExists = await Users.findOne({ email });
        if (isUserExists) {
            return Promise.reject(new CustomError('User already exits', 409));
        }
        const user = new Users({ fullName, email, number, roles: isAdmin ? ['ADMIN'] : [] });
        user.setPassword(password);
        user.setUsername(email);
        await user.save();
        delete user._doc.saltToken;
        delete user._doc.password;
        return user;
    } catch (e) {
        logger.error('Failed to add user -', e);
        return Promise.reject(new CustomError('Failed to add new user', 500));
    }
};

const resetTickets = async ({ busNumber }) => {
    try {
        const bus = await Buses.findOne({ busNumber });
        if (!bus) {
            return Promise.reject(new CustomError(`There are no seats for bus ${busNumber}`, 404));
        }
        await Seats.updateMany({ busNumber }, { $set: { isAvailable: true, status: 'Available' } });
        await Bookings.updateMany({ bus: bus._doc._id }, { $set: { active: false } });
    } catch (e) {
        logger.error('Failed to reset ticket -', e);
        return Promise.reject(new CustomError('Failed to reset ticket', 500));
    }
};

const updateBookingStatus = async ({ ticketId, status }) => {
    try {
        const booking = await Bookings.updateOne({ _id: ticketId }, { $set: { status } });
        return booking._doc;
    } catch (e) {
        logger.error('Failed to update the booking status -', e);
        return Promise.reject(new CustomError('Failed to update ticket status', 500));
    }
};

const fetchAllBookingsByBus = async ({ busNumber }) => {
    try {
        const bus = await Buses.findOne({ busNumber });
        if (!bus) {
            return Promise.reject(new CustomError(`There are no bus with bus number ${busNumber}`, 404));
        }
        const bookings = await Bookings.find({ bus: bus._doc._id, active: true }).
            populate('user').
            populate('seat');
        if (!bookings) {
            return Promise.reject(new CustomError(`No booking founds for bus ${busNumber}`, 404));
        }
        const result = [];
        for (let i = 0; i < bookings.length; i++) {
            const { _id, user, seat } = bookings[i]._doc;
            const userId = user._doc._id;
            const { email, fullName } = user._doc;
            delete seat._doc._id;
            result.push({ ticketId: _id, email, fullName, userId, ...seat._doc });
        }
        return result;
    } catch (e) {
        logger.error('Failed to list the bookings by busNumber -', e);
        return Promise.reject(new CustomError('Failed to fetch the bookings', 500));
    }
};

const deleteUser = async (userId) => {
    try {
        const resp = await Users.deleteOne({ _id: userId });
        if (resp && resp.deletedCount === 0) {
            return Promise.reject(new CustomError('User not found', 404));
        }
        const date = new Date();
        date.setDate(date.getDate() - 1);
        await Session.updateMany({ userId, createdDate: { $gte: date } }, { active: false });
    } catch (e) {
        logger.error(`Failed to delete user -${userId} - `, e);
        return Promise.reject(new CustomError('Failed to delete user', 404));
    }
};

module.exports = {
    addUser,
    resetTickets,
    updateBookingStatus,
    fetchAllBookingsByBus,
    deleteUser
};
