require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Book = require('./models/Book');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3002;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({
  status: 'OK',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

app.use('/api/books', bookRoutes);

app.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.render('index', { books });
  } catch (error) {
    console.error(error);
    res.status(500).send('Unable to load books. Check the MongoDB connection.');
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Create a .env file from .env.example.');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');
    app.listen(PORT, () => console.log(`BookBuddy Practical 7 running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}
startServer();
