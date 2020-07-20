const { generateJWT } = require('./jwtHelper');
const { Users, Session, Buses, Seats } = require('../db-seeds/mongo');

/**
 * @param usernameOrEmail
 * @param password
 * @return {Promise<undefined|*>}
 */
const verifyUser = async (usernameOrEmail, password) => {
    try {
        const userDetails = await Users.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
        if (userDetails.verifyPassword(password)) {
            return generateJWT(userDetails);
        }
        return Promise.reject(new Error('Password doesn\'t match'));
    } catch (e) {
        logger.error(`Failed to login - ${usernameOrEmail} :`, e);
        return Promise.reject(new Error('Failed to verify password, encountered an error'));
    }
};

/**
 * @param fullName
 * @param username
 * @param email
 * @param password
 * @return {Promise<undefined|*>}
 */
const signup = async ({ fullName, username, email, password }) => {
    try {
        const userDetails = await Users.findOne({ $or: [{ username }, { email }] });
        if (userDetails) {
            return Promise.reject(new CustomError('Username or email already exists', 409));
        }
        const user = new Users();
        user.fullName = fullName;
        user.setUsername(email);
        user.email = email;
        user.status = 'active';
        user.setPassword(password);
        await user.save();
        return generateJWT(user);
    } catch (e) {
        logger.error(`Failed to sign up - ${email} :`, e);
        return Promise.reject(new CustomError('Failed to sign up, encountered an error.', 422));
    }
};

/**
 * @param sessionId
 * @param email
 * @return {Promise<void>}
 */
const logout = async (sessionId, email) => {
    try {
        const sessionDetails = await Session.findOne({ _id: sessionId });
        if (!sessionDetails) {
            logger.warn(`Illegal access by user ${email} session details not found`);
            return Promise.resolve();
        }
        sessionDetails.active = false;
        sessionDetails.updatedTime = new Date().toISOString();
        await sessionDetails.save();
    } catch (e) {
        logger.error(`Failed to logout user ${email} -`, e);
        return Promise.reject(new CustomError('Failed to logout, please try again.', 500));
    }
};

/**
 * @param source
 * @param destination
 * @return {Promise<[]>}
 */

const fetchBuses = async ({ source, destination }) => {
    try {
        let query = {};
        if (source && destination) {
            query = { source: source.toUpperCase(), destination: destination.toUpperCase() };
        }
        const busesList = await Buses.find(query);
        const formattedList = [];
        for (let i = 0; i < busesList.length; i++) {
            delete busesList[i]._doc._id;
            formattedList.push(busesList[i]._doc);
        }
        return formattedList;
    } catch (e) {
        logger.error('Failed to fetch buses list -', e);
        return Promise.reject(new CustomError('There was some problem listing the buses', 500));
    }
};

/**
 * @param busNumber
 * @param seatNumber
 * @return {Promise<[]>}
 */
const fetchSeats = async ({ busNumber, seatNumber }) => {
    try {
        const query = { busNumber };
        if (seatNumber) {
            query.seatNumber = seatNumber;
        }
        const seatsList = await Seats.find(query);
        const formattedList = [];
        for (let i = 0; i < seatsList.length; i++) {
            delete seatsList[i]._doc._id;
            formattedList.push(seatsList[i]._doc);
        }
        return formattedList;
    } catch (e) {
        logger.error('Failed to fetch buses list -', e);
        return Promise.reject(new CustomError(`There was some problem listing the seats for bus ${busNumber}`, 500));
    }
};


module.exports = {
    signup,
    verifyUser,
    logout,
    fetchBuses,
    fetchSeats
};
