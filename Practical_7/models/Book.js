const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Book title is required'], trim: true, minlength: 2, maxlength: 100 },
  author: { type: String, required: [true, 'Author name is required'], trim: true, minlength: 2, maxlength: 80 },
  genre: { type: String, enum: ['Fiction','Mystery','Fantasy','Romance','Biography','Non-fiction','Drama','Other'], default: 'Fiction' },
  language: { type: String, enum: ['English','Hindi','Marathi','Other'], default: 'English' },
  description: { type: String, trim: true, maxlength: 800, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 4 },
  review: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Book', bookSchema);
