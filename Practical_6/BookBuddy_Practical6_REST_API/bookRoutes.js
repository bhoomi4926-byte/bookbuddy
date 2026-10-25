const express = require('express');
const mongoose = require('mongoose');
const Book = require('../models/Book');

const router = express.Router();

const allowedGenres = ['Fiction', 'Mystery', 'Fantasy', 'Romance', 'Biography', 'Non-fiction', 'Drama'];
const allowedLanguages = ['English', 'Hindi', 'Marathi'];

function validateBook(body) {
  const errors = [];
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';
  const genre = typeof body.genre === 'string' ? body.genre.trim() : '';
  const language = typeof body.language === 'string' ? body.language.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const image = typeof body.image === 'string' ? body.image.trim() : '';

  if (title.length < 2 || title.length > 100) errors.push('Title must contain 2–100 characters.');
  if (author.length < 2 || author.length > 80) errors.push('Author must contain 2–80 characters.');
  if (!allowedGenres.includes(genre)) errors.push('Please choose a valid genre.');
  if (!allowedLanguages.includes(language)) errors.push('Please choose a valid language.');
  if (description.length < 20 || description.length > 800) errors.push('Description must contain 20–800 characters.');

  if (image) {
    try {
      const parsed = new URL(image);
      if (!['http:', 'https:'].includes(parsed.protocol)) errors.push('Image URL must begin with http:// or https://.');
    } catch {
      errors.push('Enter a valid image URL or leave it blank.');
    }
  }

  return { errors, book: { title, author, genre, language, description, image } };
}

function handleDatabaseError(error, res) {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: Object.values(error.errors).map(item => item.message)
    });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Internal server error.' });
}

// CREATE: POST /api/books
router.post('/', async (req, res) => {
  const { errors, book } = validateBook(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Please correct the submitted data.', errors });
  }

  try {
    if (!book.image) book.image = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500';
    const createdBook = await Book.create(book);
    return res.status(201).json({ success: true, message: 'Book created successfully.', data: createdBook });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});

// READ ALL: GET /api/books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});

// READ ONE: GET /api/books/:id
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid book ID format.' });
  }
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});

// UPDATE: PUT /api/books/:id (send all required fields)
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid book ID format.' });
  }
  const { errors, book } = validateBook(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Please correct the submitted data.', errors });
  }

  try {
    if (!book.image) book.image = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500';
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {
      new: true,
      runValidators: true
    });
    if (!updatedBook) return res.status(404).json({ success: false, message: 'Book not found.' });
    return res.status(200).json({ success: true, message: 'Book updated successfully.', data: updatedBook });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});

// DELETE: DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid book ID format.' });
  }
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ success: false, message: 'Book not found.' });
    return res.status(200).json({ success: true, message: 'Book deleted successfully.', data: deletedBook });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});

module.exports = router;
