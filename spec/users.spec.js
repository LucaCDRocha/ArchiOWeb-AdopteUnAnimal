import request from 'supertest';
import app from '../app.js';
import { cleanUpDatabase } from './utils.specs.js';
import User from '../models/user.js';

let superUser;
let superUserToken;
let loginBody;

beforeEach(async () => {
    await cleanUpDatabase();

    // Create a superuser
    const newSuperUser = { firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password: 'adminpassword' };
    await request(app).post('/users').send(newSuperUser);

    // Log in as the superuser to get a token
    loginBody = { email: newSuperUser.email, password: newSuperUser.password };
    const loginRes = await request(app).post('/users/login').send(loginBody);
    superUserToken = loginRes.body.token;

    console.log("--------------------ICI--------------------");

    console.log(loginRes.body);

});

describe('Users API, get user', () => {
    it('should list all users', async () => {
        const res = await request(app).get('/users').set('Authorization', `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});

// login
describe('Users API, login', () => {
    it('should login a user', async () => {
        const res = await request(app).post('/users/login').send(loginBody);
        console.log(loginBody);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});

describe('Users API, create user', () => {
    it('should create a new user', async () => {
        const newUser = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password' };
        const res = await request(app).post('/users').send(newUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
    });
});

describe('Users API, get by ID', () => {
    it('should get a user by ID', async () => {
        const user = new User({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password' });
        await user.save();
        const res = await request(app).get(`/users/${user._id}`).set('Authorization', `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('_id', user._id.toString());
    });
});

describe('Users API, update user', () => {
    it('should update a user by ID', async () => {
        const user = new User({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password' });
        await user.save();
        const updatedUser = { firstName: 'John', lastName: 'Smith' };
        const res = await request(app).put(`/users/${user._id}`).set('Authorization', `Bearer ${superUserToken}`).send(updatedUser);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('lastName', 'Smith');
    });
});

describe('Users API, delete user', () => {
    it('should delete a user by ID', async () => {
        const user = new User({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password' });
        await user.save();
        const res = await request(app).delete(`/users/${user._id}`).set('Authorization', `Bearer ${superUserToken}`);
        expect(res.statusCode).toEqual(204);
    });
});
