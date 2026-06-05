const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'The 6 Levels of UX Maturity',
    author: 'Sarah Gibbons',
    url: 'https://www.nngroup.com/articles/ux-maturity-model/',
    likes: 0
  },
  {
    title: 'What is artificial intelligence?',
    author: 'Alexandra Klepper',
    url: 'https://web.dev/articles/ai-overview',
    likes: 0
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})


test('blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
    
  expect(response.body).toHaveLength(initialBlogs.length)

})

test('it has a id', async () => {
  const response = await api.get('/api/blogs')
    
  expect(response.body[0].id).toBeDefined()
//parei no 4.9: Testes para lista de Blog, passo2
})

test('a valid blog can be added', async () => {
  const newBlog = {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(initialBlogs.length + 1);
})
test("if doesn't exists the likes prop, likes is zero", async () => {
  const newBlog = {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.content)

  expect(response.body[response.body.length-1].likes).toBe(0)
})

test('fails with status code 400 if data invalid', async () => {
  const newBlog = {
        author: "Robert C. Martin",
        likes: 2
  }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
})


test('deleting a blog', async () => {
  //4.13 Expansões na lista de Blog, passo1
  const response = await api.get('/api/blogs');
  const firstBlogId = response.body[0].id;
    await api
      .delete(`/api/blogs/${firstBlogId}`)
      .expect(204)
})


test('updating the blog likes', async () => {
  const response = await api.get('/api/blogs');
  const blogChange = {
    likes: 3
  }
  const firstBlogId = response.body[0].id;

  await api
  .put(`/api/blogs/${firstBlogId}`)
  .send(blogChange)
  .expect(200)
})

afterAll(async () => {
  await mongoose.connection.close()
})