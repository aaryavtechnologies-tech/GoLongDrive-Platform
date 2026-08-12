// src/controllers/admin.customer.controller.js

const Customer = require('../models/Customer.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');
const { RIDE_STATUS } = require('../utils/constants');

/**
 * @route   GET /api/admin/customers
 * @desc    Get all customers with filtering, search, and pagination
 * @access  Private (Admin)
 */
const getAllCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'All' } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query = {};

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex }
    ];
  }

  if (status && status !== 'All') {
    if (status === 'Active') query.isActive = true;
    else if (status === 'Blocked' || status === 'Inactive') query.isActive = false;
  }

  // Fetch data
  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Map to frontend expected shape
  const mappedCustomers = await Promise.all(customers.map(async (c) => {
    // In a real heavy-traffic production environment, these aggregates should be batched
    // For phase 1, we do simple counts per customer on the page.
    const [totalBookings, completedTrips, cancelledTrips] = await Promise.all([
      Booking.countDocuments({ customer: c._id }),
      Booking.countDocuments({ customer: c._id, rideStatus: RIDE_STATUS.TRIP_COMPLETED }),
      Booking.countDocuments({ customer: c._id, rideStatus: { $regex: 'Cancelled', $options: 'i' } })
    ]);

    // Simple sum of total fare for completed trips (optional, defaulting to 0)
    // Could also aggregate from Payment model
    
    return {
      id: c._id.toString(),
      avatar: c.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=random`,
      name: c.fullName,
      email: c.email,
      phone: c.phoneNumber,
      gender: 'N/A', // Not in schema
      dateOfBirth: 'N/A', // Not in schema
      city: 'N/A',
      state: 'N/A',
      address: 'N/A',
      joinedDate: c.createdAt,
      status: c.isActive ? 'Active' : 'Blocked',
      totalBookings,
      completedTrips,
      cancelledTrips,
      totalSpending: 0, // Mocked for now to save query time
    };
  }));

  return sendSuccess(res, 200, 'Customers fetched successfully', {
    data: mappedCustomers,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

/**
 * @route   DELETE /api/admin/customers/:id
 * @desc    Delete a customer
 * @access  Private (Admin)
 */
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  
  await Customer.findByIdAndDelete(req.params.id);
  
  return sendSuccess(res, 200, 'Customer deleted successfully', { id: req.params.id });
});

/**
 * @route   POST /api/admin/customers
 * @desc    Create a new customer manually
 * @access  Private (Admin)
 */
const createCustomer = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  if (!fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  // Check if customer exists
  const existingCustomer = await Customer.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existingCustomer) {
    return res.status(400).json({ success: false, message: 'Customer with this email or phone already exists' });
  }

  const newCustomer = await Customer.create({
    fullName,
    email,
    phoneNumber,
    password,
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
    emailVerified: true
  });

  return sendSuccess(res, 201, 'Customer created successfully', {
    id: newCustomer._id,
    name: newCustomer.fullName,
    email: newCustomer.email,
  });
});

module.exports = {
  getAllCustomers,
  deleteCustomer,
  createCustomer
};
