// server.js — Mini Bookstore API
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===== Models =====
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  price: { type: Number, required: true },
  category: String,
  description: String,
  cover: String,
});
const Book = mongoose.model('Book', bookSchema);

// ===== Routes =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/books           → all books
// GET /api/books?category=Novels → filtered
app.get('/api/books', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = String(req.query.category);
    const books = await Book.find(filter).sort({ title: 1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Start =====
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI, { dbName: 'bookstore' })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log('🚀 Server running on http://localhost:' + PORT);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));