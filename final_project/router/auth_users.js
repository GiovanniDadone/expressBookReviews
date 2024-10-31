const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const SECRET_KEY = "your_secret_key"; // Use a secure key in production

// Function to check if username is valid
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Function to check if username and password match
const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username && user.password === password);
  return user !== undefined;
};

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if user already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already taken" });
  }

  // Register new user
  users.push({ username, password }); // Store password in plain text (for testing only)
  res.status(201).json({ message: "User registered successfully" });
});

// Login route to authenticate user and issue JWT
// Login route to authenticate user and issue JWT
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check for username and password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check for valid username and password
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

  // Send response once
  return res.json({ message: "Logged in successfully", token });
});


// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Expect the token to be in the format "Bearer <token>"

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user; // Attach user info to request
    next();
  });
};

// Add a book review (JWT-protected)
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const { isbn } = req.params; // Extract ISBN from the URL parameters
  const { review } = req.body; // Extract review from the request body

  // Check if the review text is provided
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add the review under the username of the reviewer
  books[isbn].reviews[req.user.username] = review;

  res.json({ message: "Review added successfully" });
});

// Delete a book review (JWT-protected)
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;

  console.log(`Trying to delete review for ISBN: ${isbn} by user: ${username}`);

  // Check if the book exists
  if (!books[isbn]) {
      console.log("Book not found");
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists for the authenticated user
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      console.log("Review not found for this user");
      return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];
  console.log("Review deleted successfully");
  res.json({ message: "Review deleted successfully" });
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
