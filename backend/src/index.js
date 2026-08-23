const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
console.log('dotenv loaded:', dotenvResult.parsed ? true : false, 'DATABASE_URL exists:', !!process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const { uploadSingle, handleUploadError } = require('./middleware/upload');
const isProduction = process.env.VERCEL === '1';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.post('/api/upload', uploadSingle, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});
app.use(handleUploadError);

app.use('/uploads', express.static(require('path').resolve(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);

if (!isProduction) {
  app.use('/uploads', express.static(require('path').resolve(__dirname, '..', 'uploads')));
}

app.use((err, req, res, next) => {
  console.error('API error:', err.stack || err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

