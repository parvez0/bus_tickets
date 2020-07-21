process.env.LOGGER_LOG_LEVEL = 'ERROR';
global.logger = require('../logger');
global.config = require('../config');
global.CustomError = require('../middlewares/customErrorMessage');

const app = require('../app');
const supertest = require('supertest');
const client = supertest(app);

let token = null;

describe('Index file routes', () => {
    /**
     * Verifying signup route user
     */
    it('Verify signup', async (done) => {
        const response = await client.post('/sign-up').send({
            "fullName": "Test User",
            "email": "test@tickets.com",
            "number": "9876543211",
            "password": "password"
        });
        expect(response.status).toBe(201);
        expect(response.body).toBeInstanceOf(Object);
        done();
    })
    /**
     * Verifying user login
     */
    it('Verify login route', async (done) => {
        const response = await client.post('/login').send({ usernameOrEmail: 'test@tickets.com', password: 'password' });
        if(response.body && response.body.data && response.body.data.token){
            token = `Bearer ${response.body.data.token}`
        }
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        done();
    })
    /**
     * Verifying auth route for user
     */
    it('Verify auth route for user', async (done) => {
        const res = await client.get('/user/profile')
            .set({ Authorization: token });
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        done();
    });

    /**
     * Verifying the book tickets
     */
    it('Verify booking tickets', async (done) => {
        const res = await client.post('/user/book-tickets')
            .send({
            "busNumber": "KA12DE3432",
            "seatNumbers": ["A1", "A8", "B3", "C4"]
            })
            .set({ Authorization: token });
        expect(res.status).toBe(201);
        expect(res.body).toBeInstanceOf(Object);
        done();
    });

    afterAll(done => {
        client.close();
        done();
    });
});
