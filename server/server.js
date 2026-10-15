 // server.js — Mini Bookstore API
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
// ===================== Database connection =====================
// Works locally and on Vercel: every request waits for the connection first
let dbPromise = null;
function connectDB() {
  if (!dbPromise) {
    dbPromise = mongoose.connect(process.env.MONGODB_URI, { dbName: 'bookstore' });
  }
  return dbPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    dbPromise = null;
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// ===================== Models =====================
const Book = mongoose.model('Book', new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  price: { type: Number, required: true },
  category: String,
  description: String,
  cover: String,
}));

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // stored as a bcrypt hash
}, { timestamps: true }));

const Order = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: String,
    price: Number,
    quantity: Number,
  }],
  total: Number,
  status: { type: String, default: 'pending' },
}, { timestamps: true }));

// ===================== Auth middleware =====================
// Checks the "Authorization: Bearer <token>" header
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Login required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ===================== Books =====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/books  or  /api/books?category=Novels
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

// ===================== Auth =====================
// POST /api/auth/register  { name, email, password }
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(String(password), 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login  { email, password }  →  { token, user }
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    const ok = user && (await bcrypt.compare(String(password), user.password));
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===================== Orders (protected) =====================
 // POST /api/orders  { items: [ { bookId, quantity } ] }
// Prices are taken from the database, never from the browser.
app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.bookId)) {
        return res.status(400).json({ message: 'Invalid book id' });
      }
      const book = await Book.findById(item.bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      orderItems.push({ book: book._id, title: book.title, price: book.price, quantity });
      total += book.price * quantity;
    }

    const order = await Order.create({ user: req.userId, items: orderItems, total });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/my  →  orders of the logged-in user
app.get('/api/orders/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ===================== Start =====================
app.get('/', (req, res) => {
  res.json({ message: 'Mini Bookstore API is running' });
});


// Locally we start the server ourselves; on Vercel it is started for us
if (!process.env.VERCEL) {
  const PORT = process.env.PORT ? process.env.PORT : 3000;
  app.listen(PORT, () => {
    console.log('🚀 Server running on http://localhost:' + PORT);
  });
}

module.exports = app;