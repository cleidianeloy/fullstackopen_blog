const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if (!password || password.length < 3) {
    return next({
      name: 'ValidationError',
      message: 'User validation failed: password must be at least 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    name: name,
    passwordHash: passwordHash
  })

  await user.save()
    .then((savedUser) => {
      response.status(201).json(savedUser)
    }).catch(error => next(error))

})

usersRouter.get('/', async (request, response, next) => {
  User
    .find({})
    .populate('blogs',
      {
        title: 1,
        author: 1,
        url: 1,
        likes: 1
      })
    .then(users => {
      response.json(users)
    }).catch(error => next(error))
})

//TODO: parei no 4.17: Expansão da lista de Blog, passo5
module.exports = usersRouter