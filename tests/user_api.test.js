const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const api = supertest(app);

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

describe('when there is initially one user in db', () => {
    beforeEach(async () => {

        await User.deleteMany({})

        const saltRounds = 10
        const passwordHash = await bcrypt.hash("S3cr&t", saltRounds)

        const user = new User({
            username: "root",
            name: "Administrator",
            passwordHash: passwordHash
        })

        await user.save()


    })
    test('creating a new refresh user', async () => {
        const usersAtStart = await usersInDb();
        const newUser = {
            name: "Vivek Mahthilt",
            username: "vivek.mahthilt",
            password: "3IN%h1?aC8"
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)

    })
    test('username already exists', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            name: 'Superuser',
            username: 'root',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('users are returned as json and passwordHash is not present', async () => {
        const response = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(1)

        const firstUser = response.body[0]

        expect(firstUser.id).toBeDefined()
        expect(firstUser.username).toBeDefined()
        expect(firstUser._id).toBeUndefined()
        expect(firstUser.__v).toBeUndefined()

        expect(firstUser.passwordHash).toBeUndefined()
        expect(firstUser.password).toBeUndefined()
    })
    test('password must have at least 3 characters', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            name: 'Barbra Eógan',
            username: 'barbra.eogan',
            password: 'no',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password must be at least 3 characters long')

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('username must have at least 3 characters', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            name: 'Barbra Eógan',
            username: 'ba',
            password: 'p4ssw0rd',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username is too short! It must be at least 3 characters')

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('it must have a username', async () => {
        const usersAtStart = await usersInDb();

        const newUser = {
            name: 'Barbra Eógan',
            password: 'p4ssw0rd',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})
afterAll(async () => {
    //await User.deleteMany({})
    await mongoose.connection.close()
})