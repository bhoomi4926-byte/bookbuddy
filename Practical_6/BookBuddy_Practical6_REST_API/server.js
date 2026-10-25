require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'BookBuddy REST API',
    practical: 'Practical 6',
    message: 'API is running.',
    endpoints: {
      listBooks: 'GET /api/books',
      createBook: 'POST /api/books',
      getBook: 'GET /api/books/:id',
      updateBook: 'PUT /api/books/:id',
      deleteBook: 'DELETE /api/books/:id'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/books', bookRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Request body contains invalid JSON.' });
  }
  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Copy .env.example to .env and add your MongoDB Atlas connection string.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`BookBuddy REST API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
