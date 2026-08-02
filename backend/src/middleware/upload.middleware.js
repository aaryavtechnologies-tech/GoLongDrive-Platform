// src/middleware/upload.middleware.js
// Pre-configured Multer upload helpers for specific upload destinations.

const { createUpload } = require('../config/multer');

// Single profile image upload → /uploads/profile/
const uploadProfileImage = createUpload('profile').single('profileImage');

// Generic document upload → /uploads/documents/
const uploadDocument = createUpload('documents').single('document');

module.exports = {
  uploadProfileImage,
  uploadDocument,
};
