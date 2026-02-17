var lodash = require('lodash');
const dummy = (blogs) => {
    return 1;
}
const totalLikes = (blogs) => {
    return  blogs.reduce((sum, item) => {
        return sum + item.likes
    }, 0)
}
const favoriteBlog = (blogs) => {
    const mostLikes = lodash.maxBy(blogs, 'likes')

    return {title: mostLikes.title,
            author: mostLikes.author,
            likes: mostLikes.likes
    }
}
const mostBlogs = (blogs) =>{
    const blogsByauthor = lodash.groupBy(blogs, function (item){return item.author});
    const mostBlogsArray = lodash.maxBy(Object.values(blogsByauthor), function(obj) {return obj.length});
    return {
        author: mostBlogsArray[0].author,
        likes: mostBlogsArray.length
    }
}
const mostLikes = (blogs) => {
    const blogsByauthor = lodash.groupBy(blogs, function (item){return item.author});
    const sumLikes = lodash.map(blogsByauthor, (blogs)=> {
        return {
            author: blogs[0].author,
            likes: lodash.sumBy(blogs, "likes")
        }
    });
    const blog = lodash.maxBy(sumLikes, 'likes');
    return {author: blog.author, 
            likes: blog.likes
    }
}
module.exports = {
  dummy, 
  totalLikes, 
  favoriteBlog, 
  mostBlogs,
  mostLikes
}