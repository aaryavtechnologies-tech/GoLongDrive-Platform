// src/middleware/upload.middleware.js
// Pre-configured Multer upload helpers for specific upload destinations.

const { createUpload } = require('../config/multer');

// Single profile image upload → /uploads/profile/
const uploadProfileImage = createUpload('profile').single('profileImage');

// Future upload middlewares (uncomment and use in later phases)
// const uploadAadhaar       = createUpload('aadhaar').single('aadhaar');
// const uploadDrivingLicense = createUpload('driving-license').single('drivingLicense');
// const uploadVehicleImage  = createUpload('vehicle').single('vehicleImage');
// const uploadRC            = createUpload('rc').single('rc');

module.exports = {
  uploadProfileImage,
};
