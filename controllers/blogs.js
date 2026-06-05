const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', (request, response, next) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    }).catch(error => next(error))
})

blogsRouter.post('/', (request, response, next) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })
  
  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    }).catch(error => next(error))
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