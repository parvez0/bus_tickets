process.env.LOGGER_LOG_LEVEL = 'ERROR';
global.logger = require('../logger');
global.config = require('../config');
global.CustomError = require('../middlewares/customErrorMessage');

const app = require('../app');
const supertest = require('supertest');
const client = supertest(app);

describe('Index file routes', () => {
    /**
     * Verifying server status
     */
    it('Health check test', async (done) => {
        const response = await client.get('/health-check');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ success: true, message: 'application working !!', data: {} });
        done();
    })
    /**
     * Verifying not found routes
     */
    it('Verify not found error', async (done) => {
       const res = await client.get('/where/is/my/ice/creame');
       expect(res.status).toBe(404);
       done();
    });
    /**
     * verifying unauthorised access as a user
     */
    it('verifying unauthorised access as a user', async (done) => {
        const res = await client.get('/user/profile');
        expect(res.status).toBe(401);
        done();
    });
    /**
     * verifying unauthorised access as admin
     */
    it('verifying unauthorised access as admin', async (done) => {
        const res = await client.get('/admin/profile');
        expect(res.status).toBe(401);
        done();
    });
    /**
     * verifying common routes which does not requires authentication
     */
    it('Verify common routes which does not require authentication', async (done) => {
        const res = await client.get('/buses');
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        done();
    });

    afterAll(done => {
        client.close();
        done();
    });
});
