const jwt = require('jsonwebtoken');
const { Session } = require('../db-seeds/mongo');

/**
 * middleware for authenticating the server based on valid jwt token
 */
module.exports = async (req, res, next) => {
    try {
        let token = req.cookies.TXID || req.headers.authorization;
        token = token && token.startsWith('Bearer ') ? token.slice(7) : token;
        if (!token) {
            return res.publish(false, 'Unauthorized', { message: 'Please login to perform this action' }, 401);
        }
        const details = jwt.verify(token, config.JWT.SECRET);
        const session = await Session.findOne({ _id: details.sessionId });
        if (!session) {
            return res.publish(false, 'Unauthorized', { message: 'Please login to perform this action' }, 401);
        }
        if (!session._doc.active) {
            return res.publish(false, 'Unauthorized', { message: 'Session expired, please login again' }, 401);
        }
        if (req.originalUrl.indexOf('admin') > -1) {
            if (!details.roles || !details.roles.includes('ADMIN')) {
                return res.publish(false, 'Unauthorized', { message: 'You are forbidden from accessing this resource' }, 403);
            }
        }

        /**
         * setting session id and email to req object
         */
        req.user = details.email;
        req.sessionId = details.sessionId;
        req.userId = details.userId;
        next();
    } catch (e) {
        logger.error('Failed to verify authentication :', e.message);
        return res.publish(false, 'Unauthorized', { message: 'Session expired, please login again' }, 401);
    }
};
