const { Buses, Seats, Users } = require('./mongo');

const busesInfo = [
    {
        busNumber: 'KA12DE3432',
        busName: 'Orange Express',
        availableSeats: 40,
        source: 'Bangalore',
        destination: 'Hyderabad'
    }
];

const startSeedOfUsers = async () => {
    try {
        const docsCount = await Users.estimatedDocumentCount();
        if (docsCount) {
            return;
        }
        logger.info('Starting the seed for first admin user');
        const user = new Users();
        user.fullName = 'Admin';
        user.email = 'admin@tech.com';
        user.number = 9876543211;
        user.roles = ['ADMIN'];
        user.setPassword('pa$$word');
        user.setUsername('admin@tech.com');
        await user.save();
        logger.info('Created admin user with password -', 'pa$$word');
    } catch (e) {
        logger.error('Failed to seed admin collection -', e);
    }
};

const startSeedOfBuses = async () => {
    try {
        const docsCount = await Buses.estimatedDocumentCount();
        if (docsCount) {
            return;
        }
        logger.info('Starting the seed for bus collection');
        for (let i = 0; i < busesInfo.length; i++) {
            const bus = new Buses();
            bus.busNumber = busesInfo[i].busNumber;
            bus.busName = busesInfo[i].busName;
            bus.availableSeats = busesInfo[i].availableSeats;
            // eslint-disable-next-line no-await-in-loop
            await bus.save();
            logger.info('Created bus entry for busNumber -', busesInfo[i].busNumber);
        }
    } catch (e) {
        logger.error('Failed to seed bus collection -', e);
    }
};

const startSeedOfSeats = async () => {
    try {
        const docsCount = await Seats.estimatedDocumentCount();
        if (docsCount) {
            return;
        }
        const seatPrefixs = ['A', 'B', 'C', 'D'];
        let seatPrefixIndex = 1;
        logger.info('Starting the seed for seats collection');
        for (let i = 0; i < busesInfo.length; i++) {
            for (let j = 0; j < busesInfo[i].availableSeats; j++) {
                const seat = new Seats();
                seat.busNumber = busesInfo[i].busNumber;
                seat.seatNumber = seatPrefixs[j % 4] + seatPrefixIndex;
                // eslint-disable-next-line no-await-in-loop
                await seat.save();
                logger.debug('Record created in seats collection for seat ', seat.seatNumber, 'busNumber', seat.busNumber);
                if ((j + 1) % 4 === 0) {
                    seatPrefixIndex++;
                }
            }
            logger.info(`Created ${busesInfo[i].availableSeats} seats entry bus entry for busNumber -`, busesInfo[i].busNumber);
        }
    } catch (e) {
        logger.error('Failed to seed seats collection -', e);
    }
};

const startSeeding = async () => {
    if (config.MONGODB.SEEDING) {
        await startSeedOfUsers();
        await startSeedOfBuses();
        await startSeedOfSeats();
    }
};

module.exports = startSeeding;
