
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// User login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  const accessToken = jwt.sign({ username }, 'access', {
    expiresIn: '1h'
  });

  return res.status(200).json({
    message: 'User successfully logged in',
    accessToken
  });
});

// Add or update a review for the logged-in user
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user && req.user.username;
  const review = req.body.review || req.query.review;

  if (!username) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!review) {
    return res.status(400).json({ message: 'Review is required' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: books[isbn].reviews
  });
});

// Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user && req.user.username;

  if (!username) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) {
    return res.status(404).json({
      message: 'No review found for this user'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully',
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.authenticatedUser = authenticatedUser;
module.exports.isValid = isValid;
module.exports.users = users;
