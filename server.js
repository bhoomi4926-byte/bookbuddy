const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'books.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([
    { id: 1, title: 'The Silent Patient', author: 'Alex Michaelides', genre: 'Mystery', language: 'English', description: 'A gripping psychological thriller about a painter who stops speaking after a shocking incident.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', reviews: [{ id: 1, name: 'Aarav', rating: 5, text: 'A gripping mystery with a surprising ending.' }] },
    { id: 2, title: 'The Alchemist', author: 'Paulo Coelho', genre: 'Fiction', language: 'English', description: 'A young shepherd travels in search of treasure and discovers the meaning of following his dreams.', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', reviews: [] },
    { id: 3, title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', genre: 'Biography', language: 'English', description: 'An inspiring autobiography about perseverance, science, and a remarkable journey.', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=500', reviews: [] }
  ], null, 2));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

function readBooks() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (error) { console.error('Could not read books.json:', error.message); return []; }
}
function writeBooks(books) { fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2)); }
function clean(value) { return typeof value === 'string' ? value.trim() : ''; }
function validateBook(body) {
  const errors = [];
  const title = clean(body.title), author = clean(body.author), genre = clean(body.genre);
  const language = clean(body.language), description = clean(body.description), image = clean(body.image);
  if (title.length < 2 || title.length > 100) errors.push('Title must contain 2–100 characters.');
  if (author.length < 2 || author.length > 80) errors.push('Author must contain 2–80 characters.');
  if (!['Fiction', 'Mystery', 'Fantasy', 'Romance', 'Biography', 'Non-fiction', 'Drama'].includes(genre)) errors.push('Please choose a valid genre.');
  if (!['English', 'Hindi', 'Marathi'].includes(language)) errors.push('Please choose a valid language.');
  if (description.length < 20 || description.length > 800) errors.push('Description must contain 20–800 characters.');
  if (image) {
    try { const parsed = new URL(image); if (!['http:', 'https:'].includes(parsed.protocol)) errors.push('Image URL must begin with http:// or https://.'); }
    catch { errors.push('Enter a valid image URL or leave it blank.'); }
  }
  return { errors, book: { title, author, genre, language, description, image } };
}
function validateReview(body, books) {
  const errors = [];
  const bookId = Number(body.bookId), name = clean(body.name), rating = Number(body.rating), text = clean(body.text);
  if (!Number.isInteger(bookId) || !books.some(book => book.id === bookId)) errors.push('Please select an existing book.');
  if (name.length < 2 || name.length > 50) errors.push('Your name must contain 2–50 characters.');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Rating must be a whole number from 1 to 5.');
  if (text.length < 5 || text.length > 500) errors.push('Review must contain 5–500 characters.');
  return { errors, review: { bookId, name, rating, text } };
}

app.get('/', (req, res) => {
  const books = readBooks();
  res.render('home', { title: 'Home', books: books.slice(0, 3), totalBooks: books.length, totalReviews: books.reduce((n, b) => n + (b.reviews || []).length, 0) });
});
app.get('/books', (req, res) => {
  const allBooks = readBooks();
  const q = clean(req.query.q).toLowerCase();
  const genre = clean(req.query.genre);
  const books = allBooks.filter(b => (!q || `${b.title} ${b.author}`.toLowerCase().includes(q)) && (!genre || b.genre === genre));
  res.render('books', { title: 'Explore Books', books, q: clean(req.query.q), genre, genres: ['Fiction', 'Mystery', 'Fantasy', 'Romance', 'Biography', 'Non-fiction', 'Drama'] });
});
app.get('/books/new', (req, res) => res.render('add-book', { title: 'Add a Book', errors: [], values: {}, success: req.query.success || '' }));
app.post('/books', (req, res) => {
  const { errors, book } = validateBook(req.body);
  if (errors.length) return res.status(400).render('add-book', { title: 'Add a Book', errors, values: req.body, success: '' });
  const books = readBooks();
  book.id = books.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;
  book.image = book.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500';
  book.reviews = [];
  books.unshift(book);
  writeBooks(books);
  res.redirect('/books/new?success=' + encodeURIComponent(`“${book.title}” was added successfully.`));
});
app.get('/reviews/new', (req, res) => res.render('add-review', { title: 'Write a Review', books: readBooks(), errors: [], values: {}, success: req.query.success || '' }));
app.post('/reviews', (req, res) => {
  const books = readBooks();
  const { errors, review } = validateReview(req.body, books);
  if (errors.length) return res.status(400).render('add-review', { title: 'Write a Review', books, errors, values: req.body, success: '' });
  const book = books.find(b => b.id === review.bookId);
  book.reviews = book.reviews || [];
  book.reviews.unshift({ id: Date.now(), name: review.name, rating: review.rating, text: review.text });
  writeBooks(books);
  res.redirect('/reviews/new?success=' + encodeURIComponent('Your review was submitted successfully.'));
});
app.get('/books/:id', (req, res) => {
  const book = readBooks().find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).render('not-found', { title: 'Book Not Found' });
  res.render('book-detail', { title: book.title, book });
});
app.use((req, res) => res.status(404).render('not-found', { title: 'Page Not Found' }));
app.listen(PORT, '0.0.0.0', () => console.log(`BookBuddy Express server running at http://localhost:${PORT}`));
