// src/validators/booking.validator.js

const { body, param, query } = require('express-validator');
const { TRIP_TYPES, PAYMENT_METHODS } = require('../utils/constants');

// Check if a date string is valid and not in the past (ignoring time for simplicity, or considering current date)
const isValidDate = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Set time to 00:00:00 for past date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    throw new Error('Date cannot be in the past');
  }
  return true;
};

const createBookingValidator = [
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('pickupCity').trim().notEmpty().withMessage('Pickup city is required'),
  body('pickupState').trim().notEmpty().withMessage('Pickup state is required'),
  body('pickupPincode').trim().notEmpty().withMessage('Pickup pincode is required'),
  
  body('dropAddress').trim().notEmpty().withMessage('Drop address is required'),
  body('dropCity').trim().notEmpty().withMessage('Drop city is required'),
  body('dropState').trim().notEmpty().withMessage('Drop state is required'),
  body('dropPincode').trim().notEmpty().withMessage('Drop pincode is required'),
  
  body('tripType').trim().notEmpty().withMessage('Trip type is required')
    .isIn(Object.values(TRIP_TYPES)).withMessage('Invalid trip type'),
    
  body('pickupDate').notEmpty().withMessage('Pickup date is required').custom(isValidDate),
  body('pickupTime').trim().notEmpty().withMessage('Pickup time is required'),
  
  body('vehicleType').trim().notEmpty().withMessage('Vehicle type is required'),
  body('numberOfPassengers').isInt({ min: 1 }).withMessage('At least 1 passenger is required'),
  
  body('paymentMethod').optional().isIn(Object.values(PAYMENT_METHODS)).withMessage('Invalid payment method')
];

const updateBookingValidator = [
  param('id').isMongoId().withMessage('Invalid booking ID format'),
  body('pickupDate').optional().custom(isValidDate),
  body('numberOfPassengers').optional().isInt({ min: 1 }).withMessage('At least 1 passenger is required'),
  body('tripType').optional().isIn(Object.values(TRIP_TYPES)).withMessage('Invalid trip type')
];

const cancelBookingValidator = [
  param('id').isMongoId().withMessage('Invalid booking ID format'),
  body('reason').optional().isString().trim()
];

const getBookingDetailsValidator = [
  param('id').isMongoId().withMessage('Invalid booking ID format')
];

const filterBookingsValidator = [
  query('status').optional().isString().trim(),
  query('date').optional().isString().trim(),
  query('vehicleType').optional().isString().trim()
];

module.exports = {
  createBookingValidator,
  updateBookingValidator,
  cancelBookingValidator,
  getBookingDetailsValidator,
  filterBookingsValidator
};
