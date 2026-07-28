const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', (request, response, next) => {
  Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
    .then(blogs => {

      response.json(blogs)
    }).catch(error => next(error))
})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    const user = await User.findById(body.userId)

    if (!user) {
      return response.status(404).json({ error: 'user not found' })
    }


    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user.id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog.id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error) // Envia qualquer erro para o seu errorHandler
  }
})


blogsRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

blogsRouter.put('/:id', (request, response, next) => {
 const body = request.body
  const blog = {}
  const keysBody = Object.keys(body);

  keysBody.forEach((prop)=>{
    if(body[prop] !== undefined){
      blog[prop] = body[prop];
    }
  })

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
    .then(updatedBlog => {
      response.json(updatedBlog);
    })
    .catch(error => next(error))
})

module.exports = blogsRouter;