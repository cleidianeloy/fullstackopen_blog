const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)

let initialBlogs = [];

beforeEach(async () => {
  await helper.deleteAllUsers();
  await helper.deleteAllBlogs();

 const savedUser = await helper.newUser({
    username: "rootblog",
    name: "Blog Administrator",
    password: "S3cr&t"
  });

  initialBlogs = await helper.getInitialBlogs(savedUser);
  const blogIds = initialBlogs.map(b => b.id);
  const userContent = {    
    blogs: blogIds
  }
  await helper.userUpdate(savedUser.id, userContent);
});


test('blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)

})

test('it has a id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()

})

test('a valid blog can be added', async () => {
  const user = await helper.getOneUser();
  const newBlog = {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    userId: user.id,
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
  const user = await helper.getOneUser();
  const newBlog = {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    userId: user.id,
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')


  expect(response.body[response.body.length - 1].likes).toBe(0)
})

test('fails with status code 400 if data invalid', async () => {
  const user = await helper.getOneUser()
  const newBlog = {
    author: "Robert C. Martin",
    userId: user.id,
    likes: 2
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})


test('deleting a blog', async () => {
  const blog = await helper.getOneBlog();
  const blogId = blog.id;
  await api
    .delete(`/api/blogs/${blogId}`)
    .expect(204)
})


test('updating the blog likes', async () => {
  const blog = await helper.getOneBlog();
  const blogId = blog.id;
  const blogChange = {
    likes: 3
  }

  await api
    .put(`/api/blogs/${blogId}`)
    .send(blogChange)
    .expect(200)
})

afterAll(async () => {
  await mongoose.connection.close()
})