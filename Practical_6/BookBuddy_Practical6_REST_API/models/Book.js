const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, trim: true, minlength: 2, maxlength: 50 },
  rating: { type: Number, min: 1, max: 5 },
  text: { type: String, trim: true, minlength: 5, maxlength: 500 }
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 2, maxlength: 100 },
  author: { type: String, required: [true, 'Author is required'], trim: true, minlength: 2, maxlength: 80 },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: ['Fiction', 'Mystery', 'Fantasy', 'Romance', 'Biography', 'Non-fiction', 'Drama']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['English', 'Hindi', 'Marathi']
  },
  description: { type: String, required: [true, 'Description is required'], trim: true, minlength: 20, maxlength: 800 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', trim: true },
  reviews: { type: [reviewSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);

