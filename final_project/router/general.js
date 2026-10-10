
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'User already exists'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book by ISBN using Axios and async/await
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get books by author using Axios and promises
public_users.get('/author/:author', (req, res) => {
  axios.get('http://localhost:5000/')
    .then(response => {
      const author = req.params.author.toLowerCase();

      const matchingBooks = Object.values(response.data).filter(book =>
        book.author && book.author.toLowerCase().includes(author)
      );

      return res.status(200).json(matchingBooks);
    })
    .catch(() => {
      return res.status(500).json({ message: 'Unable to retrieve books' });
    });
});

// Get books by title using Axios and async/await
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    const title = req.params.title.toLowerCase();

    const matchingBooks = Object.values(response.data).filter(book =>
      book.title && book.title.toLowerCase().includes(title)
    );

    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
