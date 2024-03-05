import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 8000;
let blogPost = [];

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('js'));

app.set('view engine', 'ejs');

// functions .................
//Function for Generating a random alphanumeric string as the ID

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}
// Function for truncating the full blog post...........

function truncateContent(content, maxLength) {
  if (content.length > maxLength) {
    return content.slice(0, maxLength);
  }
  return content;
}
// Make truncateContent function available globally
app.locals.truncateContent = truncateContent;
// Function for adding the blog post ....

function addBlogPost(title, content) {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();

  if (trimmedTitle === "" || trimmedContent === "") {
    console.log("Title or content is empty. Cannot add post.");
    return null;
  }

  const newPost = {
    id: generateId(),
    title: trimmedTitle,
    content: trimmedContent
  };

  return newPost;
}
// Getting all routes 
//Home page route
app.get("/", function (req, res) {
  res.render("index.ejs", { Allpost: blogPost });
});
//Compose page route
app.get("/compose", function (req, res) {
  res.render("compose.ejs");
});
//Full post route
app.get("/posts", function (req, res) {
  res.render("posts.ejs", { Allpost: blogPost });
});
// Full post route
app.get("/posts/:id", (req, res) => {
  const postId = req.params.id;
  const post = blogPost.find(post => post.id === postId);
  if (post) {
    res.render("posts.ejs", { post }); // Pass the post variable to the template
  } else {
    // Handle the case where the post ID is not found
    res.status(404).send("<script>alert('Post not found. Redirecting to home page...'); setTimeout(() => { window.location.href = '/'; }, 2000);</script>");

  }
});
// Edit post route
app.get("/edit-post/:id", (req, res) => {
  const postId = req.params.id;
  const post = blogPost.find(post => post.id === postId);
  if (post) {
    res.render("edit.ejs", { post });
  } else {
    res.status(404).send("Post not found");
  }
});
app.get("/confirm", (req, res) => {
  res.render("confirm.ejs");
});
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

// Post methods ...
app.post("/compose", function (req, res) {
  const postTitle = req.body["title"];
  const postContent = req.body["content"];

  const newPost = addBlogPost(postTitle, postContent);
  if (newPost) {
    blogPost.push(newPost);
    res.redirect("/");
  } else {
    // Passing the error message as a variable when rendering the template
    res.render("compose.ejs", { error: "Please enter both title and content." });
  }
});
app.post("/edit-post/:id", (req, res) => {
  const postId = req.params.id;
  const postIndex = blogPost.findIndex(post => post.id === postId);

  if (postIndex !== -1) {
    const updatedPost = {
      id: postId,
      title: req.body.title,
      content: req.body.content
    };

    // Update the post in your array
    blogPost[postIndex] = updatedPost;

    // Redirect to the confirmation page
    res.redirect("/confirm");
  } else {
    // Handle the case where the post ID is not found
    res.status(404).send("Post not found");
  }
});

// Delete post route
app.post('/delete-post/:id', (req, res) => {
  const postId = req.params.id;

  // Find the index of the post in the blogPost array
  const postIndex = blogPost.findIndex(post => post.id === postId);

  // Check if the post exists
  if (postIndex !== -1) {
    // Remove the post from the array
    blogPost = blogPost.filter(post => post.id !== postId);
    res.redirect('/');
  } else {
    // If the post does not exist, send a 404 error
    res.status(404).send('Post not found');
  }
});




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
