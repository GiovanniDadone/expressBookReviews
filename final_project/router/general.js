const express = require("express");
let books = require("./booksdb.js");
const public_users = express.Router();

let users = [];

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already taken" });
  }

  // Register new user
  users.push({ username, password });
  res.json({ message: "User registered successfully" });
});

// Get the list of all books
public_users.get("/", (req, res) => {
  res.json(books);
});

// Get a book by ISBN
public_users.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get books by author
public_users.get("/author/:author", (req, res) => {
  const authorBooks = Object.values(books).filter((book) => book.author.toLowerCase() === req.params.author.toLowerCase());

  if (authorBooks.length > 0) {
    res.json(authorBooks);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get books by title
public_users.get("/title/:title", (req, res) => {
  const titleBooks = Object.values(books).filter((book) => book.title.toLowerCase() === req.params.title.toLowerCase());

  if (titleBooks.length > 0) {
    res.json(titleBooks);
  } else {
    res.status(404).json({ message: "No books found for this title" });
  }
});

// Get book reviews
public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (book) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
module.exports.users = users;
