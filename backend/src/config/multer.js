// src/config/multer.js
// Multer disk-storage configuration for local image uploads.
// Stores files under backend/uploads/<destination> with unique filenames.

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } = require('../utils/constants');
const ApiError = require('../utils/ApiError');

// ── Disk Storage ──────────────────────────────────────────────────────────────

const storage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads', destination));
    },
    filename: (req, file, cb) => {
      // e.g.  a3f8c1d2-1690000000000.jpg
      const uniqueName = `${crypto.randomUUID()}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`;
      cb(null, uniqueName);
    },
  });

// ── File Filter ───────────────────────────────────────────────────────────────

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type: "${file.mimetype}". Only JPG, JPEG, PNG, and WEBP are allowed.`
      ),
      false
    );
  }
};

// ── Multer Factory ────────────────────────────────────────────────────────────

/**
 * Creates a multer instance for the specified upload subdirectory.
 * @param {string} destination  Subfolder inside /uploads  (e.g. 'profile')
 */
const createUpload = (destination) =>
  multer({
    storage: storage(destination),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  });

module.exports = { createUpload };
