const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;
const Model = mongoose.model;

const mongodbConnectionUri = `${config.MONGODB.URI}/${config.MONGODB.DATABASE}?${config.MONGODB.ARGUMENTS}`;
logger.info(`Generated mongodb uri : ${mongodbConnectionUri}`);

/**
 * checking if mongodb is running otherwise don't start the project
 */
(async () => {
    try {
        await mongoose.connect(mongodbConnectionUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
        logger.info('Mongodb connection established');
    } catch (e) {
        logger.error('Failed to established a connection with mongodb, exiting the process : ', e);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
})();

/**
 * schema for users collection where users login information will be stored
 */
const usersSchema = new Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String },
    number: { type: Number },
    saltToken: { type: String },
    email: { type: String, index: { unique: true } },
    status: { type: String, default: true },
    roles: { type: Array },
    createdDate: { type: Date, default: Date.now() },
    updatedDate: { type: Date, default: Date.now() }
});

usersSchema.methods.setPassword = function (password) {

    /**
     * for creating a password we require a random string which will be appended with the original password
     * and a hash will be created.
     */
    this.saltToken = crypto.randomBytes(20).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.saltToken, 1024, 64, 'sha256').toString('hex');
};

usersSchema.methods.setUsername = function (email) {

    /**
     * creating unique username from email by replace special characters
     */
    this.username = email.replace(/@|\./ig, '');
};

usersSchema.methods.verifyPassword = function (password) {

    /**
     * password will be stored as a hash in the db, to verify the password provided by user first we need to create the hash and
     * then compare it with the original password's hash
     */
    const passwordHash = crypto.pbkdf2Sync(password, this.saltToken, 1024, 64, 'sha256').toString('hex');
    return passwordHash === this.password;
};

usersSchema.index({ email: 1, status: 1 });

/**
 * schema for sessions collection where session info of the users and there auth token will be stored
 */
const sessionSchema = new Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    ip: { type: String },
    device: { type: String },
    createdDate: { type: Date, default: Date.now() },
    updatedDate: { type: Date, default: Date.now() }
});

sessionSchema.index({ _id: 1, active: 1 });

/**
 * schema for buses collection
 */
const busSchema = new Schema({
    busNumber: { type: String, required: true },
    busName: { type: String },
    source: { type: String },
    destination: { type: String },
    availableSeats: { type: Number },
    createdDate: { type: Date, default: Date.now() },
    updatedDate: { type: Date }
});

busSchema.index({ busNumber: 1 });
busSchema.index({ destination: 1 });
busSchema.index({ source: 1 });
busSchema.index({ source: 1, destination: 1 });

/**
 * schema for seats collection
 */
const seatsSchema = new Schema({
    seatNumber: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    status: { type: String, required: true, default: 'AVAILABLE' },
    busNumber: { type: String, required: true },
    createdDate: { type: Date, default: Date.now() },
    updatedDate: { type: Date, default: Date.now() }
});

seatsSchema.index({ seatNumber: 1 });
seatsSchema.index({ isAvailable: -1 });
seatsSchema.index({ status: 1, busNumber: 1 });

/**
 * schema for bookings collection
 */
const bookingsSchema = new Schema({
    bus: { type: Schema.Types.ObjectId, ref: 'buses' },
    seat: { type: Schema.Types.ObjectId, ref: 'seats' },
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    active: { type: Boolean, required: true, default: true },
    createdDate: { type: Date, default: Date.now() },
    updateDate: { type: Date, default: Date.now() }
});

bookingsSchema.index({ userId: 1 });
bookingsSchema.index({ userId: 1, active: 1 });
bookingsSchema.index({ seat: 1, active: 1 });

/**
 * collection models objects
 */
const Users = Model('users', usersSchema);
const Session = Model('sessions', sessionSchema);
const Buses = Model('buses', busSchema);
const Seats = Model('seats', seatsSchema);
const Bookings = Model('bookings', bookingsSchema);

module.exports = {
    mongoose,
    Users,
    Session,
    Buses,
    Seats,
    Bookings
};
