const Blog = require('../models/blog')
const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.getBlogs = async () => {
    const blogs = await Blog.find({});
    return blogs.map(blog => blog.toJSON());
}
exports.getUsers = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
}
exports.getOneUser = async () => {
    const user = await User.findOne({});
    return user.toJSON();
}
exports.getOneBlog = async () => {
    const blog = await Blog.findOne({});
    return blog.toJSON();
}
exports.deleteAllBlogs = async () => {
    await Blog.deleteMany({});
}
exports.deleteAllUsers = async () => {
    await User.deleteMany({});
}
exports.newUser = async ({ username, name, password }) => {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        username: username,
        name: name,
        passwordHash: passwordHash
    });
    const savedUser = await user.save()
    return savedUser.toJSON();
}
exports.getInitialBlogs = async (savedUser) => {
    let initialBlogs = [];
    const testBlogs = [
        {
            title: 'The 6 Levels of UX Maturity',
            author: 'Sarah Gibbons',
            user: savedUser.id,
            url: 'https://www.nngroup.com/articles/ux-maturity-model/',
            likes: 0
        },
        {
            title: 'What is artificial intelligence?',
            author: 'Alexandra Klepper',
            user: savedUser.id,
            url: 'https://web.dev/articles/ai-overview',
            likes: 0
        }
    ];

    for (let blog of testBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save();
        initialBlogs.push(blogObject.toJSON());
    }
    console.log(initialBlogs)
    return initialBlogs;
}
exports.userUpdate = async (id, content) => {
  await User.findByIdAndUpdate(id, content);
}
