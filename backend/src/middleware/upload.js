const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { upload } = require('@vercel/blob');

const isProduction = process.env.VERCEL === '1';
const uploadDir = path.resolve(__dirname, '..', 'uploads');

if (!isProduction && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (png, jpg, webp, gif) are allowed.'), false);
  }
};
const uploadLocal = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

async function uploadSingle(req, res, next) {
  return new Promise((resolve, reject) => {
    uploadLocal.single('image')(req, res, (err) => {
      if (err) return reject(err);
      if (!req.file) return reject(new Error('No image file provided.'));
      if (isProduction) {
        upload(req.file.buffer, { access: 'public', prefix: 'uploads/' })
          .then((blob) => {
            req.file.url = blob.url;
            resolve();
          })
          .catch(reject);
      } else {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = `${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, req.file.buffer);
        req.file.filename = filename;
        req.file.path = filepath;
        req.file.url = `/uploads/${filename}`;
        resolve();
      }
    });
  });
}

function handleUploadError(err, req, res, next) {
  if (err) {
    return res.status(400).json({ message: err.message || 'Upload failed.' });
  }
  next();
}

module.exports = { uploadSingle, handleUploadError };
