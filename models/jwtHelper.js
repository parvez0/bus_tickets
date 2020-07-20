const jwt = require('jsonwebtoken');
const { mongoose, Session } = require('../db-seeds/mongo');

/**
 * randomString function will create a random alpha numeric string to be used as JWT Secret
 */
const randomString = (length = 20) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let random = '';
    for (let i = 0; i < length; i++) {
        random += chars[Math.floor(Math.random() * chars.length)];
    }
    logger.info('JWT secret ================= :', random);
    return random;
};

/**
 * setting the JWT Secret to global config if it is not provided
 */
config.JWT.SECRET = config.JWT.SECRET || randomString();

const generateJWT = async (userDetails) => {
    const userId = userDetails._doc._id;
    delete userDetails._doc.password;
    delete userDetails._doc.saltToken;
    delete userDetails._doc._id;
    const sessionId = mongoose.Types.ObjectId();
    const token = jwt.sign({ ...userDetails._doc, sessionId, userId }, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRY_TIME || 86400 });
    const session = new Session({ userId, token, _id: sessionId });
    await session.save();
    return token;
};

module.exports = { generateJWT };
