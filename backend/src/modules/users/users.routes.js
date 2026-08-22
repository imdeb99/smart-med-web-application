const { Router } = require('express');
const multer = require('multer');
const authenticate = require('../../middleware/auth');
const controller = require('./users.controller');

const router = Router();

// Avatar uploads: in-memory (no disk writes), max 5MB, images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      const err = new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed.');
      err.statusCode = 400;
      return cb(err);
    }
    cb(null, true);
  },
});

router.post('/me/avatar', authenticate, upload.single('avatar'), controller.uploadMyAvatar);

module.exports = router;
