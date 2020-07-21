process.env.LOGGER_LOG_LEVEL = 'ERROR';
global.logger = require('../logger');
global.config = require('../config');
global.CustomError = require('../middlewares/customErrorMessage');

const app = require('../app');
const supertest = require('supertest');
const client = supertest(app);

let token = null;
let userId = null;

describe('Index file routes', () => {
    /**
     * Verifying login for admin
     */
    it('Verify login route', async (done) => {
        const response = await client.post('/login').send({ usernameOrEmail: 'admin@tech.com', password: 'pa$$word' });
        if(response.body && response.body.data && response.body.data.token){
            token = `Bearer ${response.body.data.token}`
        }
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Object);
        done();
    })
    /**
     * Verifying fetch user status
     */
    it('Verify fetch bookings status', async (done) => {
        const res = await client.get('/admin/bookings-by-bus/KA12DE3432')
            .set({ Authorization: token });
        if(res && res.body && res.body.data && res.body.data.bookings){
            userId = res.body.data.bookings[0].userId;
        }
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        done();
    });
    /**
     * Delete user
     */
    it('Verify delete user', async (done) => {
        const res = await client.delete(`/admin/delete-user/${userId}`)
            .set({ Authorization: token });
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        done();
    });
    /**
     * Reset all tickets status
     */
    it('Verify reset tickets', async (done) => {
        const res = await client.post(`/admin/reset-tickets`)
            .send({ "busNumber": "KA12DE3432" })
            .set({ Authorization: token });
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        done();
    });

    afterAll(done => {
        client.close();
        done();
    });
});
