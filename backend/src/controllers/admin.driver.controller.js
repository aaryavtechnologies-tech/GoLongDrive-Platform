// src/controllers/admin.driver.controller.js

const Driver = require('../models/Driver.model');
const Booking = require('../models/Booking.model');
const Payment = require('../models/Payment.model');
const { sendSuccess } = require('../helpers/response.helper');
const asyncHandler = require('../utils/asyncHandler');
const { DRIVER_STATUS, ONLINE_STATUS, AVAILABILITY_STATUS, RIDE_STATUS } = require('../utils/constants');

/**
 * @route   GET /api/admin/drivers
 * @desc    Get all drivers with filtering, search, and pagination
 * @access  Private (Admin)
 */
const getAllDrivers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'All', availability = 'All', vehicleType = 'All' } = req.query;
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
      { phoneNumber: searchRegex },
      { 'vehicle.registrationNumber': searchRegex }
    ];
  }

  // Filter by approval status
  if (status && status !== 'All') {
    // Map frontend statuses to backend enums if they differ
    query.driverStatus = status;
  }

  // Filter by availability (Online/Offline/On Trip)
  if (availability && availability !== 'All') {
    if (availability === 'Online') query.onlineStatus = ONLINE_STATUS.ONLINE;
    else if (availability === 'Offline') query.onlineStatus = ONLINE_STATUS.OFFLINE;
    else query.availabilityStatus = availability; 
  }

  if (vehicleType && vehicleType !== 'All') {
    query['vehicle.type'] = vehicleType;
  }

  // Fetch data
  const total = await Driver.countDocuments(query);
  const drivers = await Driver.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Map to frontend expected shape
  const mappedDrivers = drivers.map(d => {
    return {
      id: d._id.toString(),
      avatar: d.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName)}&background=random`,
      name: d.fullName,
      email: d.email,
      phone: d.phoneNumber,
      gender: 'N/A', // Not in schema
      dateOfBirth: d.dateOfBirth || 'N/A',
      address: d.address?.street || 'N/A',
      city: d.address?.city || 'N/A',
      state: d.address?.state || 'N/A',
      pincode: d.address?.pincode || 'N/A',
      emergencyContact: 'N/A',
      experience: 'N/A',
      status: d.driverStatus || 'Pending',
      availability: d.onlineStatus === ONLINE_STATUS.ONLINE ? d.availabilityStatus : 'Offline',
      joinedDate: d.createdAt,
      vehicle: {
        brand: d.vehicle?.brand || 'N/A',
        model: d.vehicle?.model || 'N/A',
        variant: 'N/A',
        vehicleNumber: d.vehicle?.registrationNumber || 'N/A',
        vehicleType: d.vehicle?.type || 'N/A',
        fuelType: d.vehicle?.fuelType || 'N/A',
        year: d.vehicle?.manufacturingYear || 'N/A',
        color: 'N/A',
        seatCapacity: d.vehicle?.seatingCapacity || 4,
        acAvailable: d.vehicle?.acAvailable === 'Yes',
        luggageCapacity: 'Medium',
        insuranceExpiry: 'N/A',
        pucExpiry: 'N/A',
      }
    };
  });

  return sendSuccess(res, 200, 'Drivers fetched successfully', {
    data: mappedDrivers,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

/**
 * @route   GET /api/admin/drivers/:id
 * @desc    Get driver by ID
 * @access  Private (Admin)
 */
const getDriverById = asyncHandler(async (req, res) => {
  const d = await Driver.findById(req.params.id);
  if (!d) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  const mappedDriver = {
    id: d._id.toString(),
    avatar: d.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName)}&background=random`,
    name: d.fullName,
    email: d.email,
    phone: d.phoneNumber,
    gender: 'N/A',
    dateOfBirth: d.dateOfBirth || 'N/A',
    address: d.address?.street || 'N/A',
    city: d.address?.city || 'N/A',
    state: d.address?.state || 'N/A',
    pincode: d.address?.pincode || 'N/A',
    emergencyContact: 'N/A',
    experience: 'N/A',
    status: d.driverStatus || 'Pending',
    availability: d.onlineStatus === ONLINE_STATUS.ONLINE ? d.availabilityStatus : 'Offline',
    joinedDate: d.createdAt,
    vehicle: {
      brand: d.vehicle?.brand || 'N/A',
      model: d.vehicle?.model || 'N/A',
      variant: 'N/A',
      vehicleNumber: d.vehicle?.registrationNumber || 'N/A',
      vehicleType: d.vehicle?.type || 'N/A',
      fuelType: d.vehicle?.fuelType || 'N/A',
      year: d.vehicle?.manufacturingYear || 'N/A',
      color: 'N/A',
      seatCapacity: d.vehicle?.seatingCapacity || 4,
      acAvailable: d.vehicle?.acAvailable === 'Yes',
      luggageCapacity: 'Medium',
      insuranceExpiry: 'N/A',
      pucExpiry: 'N/A',
    }
  };

  return sendSuccess(res, 200, 'Driver fetched successfully', mappedDriver);
});

/**
 * @route   POST /api/admin/drivers
 * @desc    Create a new driver manually
 * @access  Private (Admin)
 */
const createDriver = asyncHandler(async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  if (!fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  // Check if driver exists
  const existingDriver = await Driver.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existingDriver) {
    return res.status(400).json({ success: false, message: 'Driver with this email or phone already exists' });
  }

  const newDriver = await Driver.create({
    fullName,
    email,
    phoneNumber,
    password,
    driverStatus: DRIVER_STATUS.PENDING,
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
  });

  return sendSuccess(res, 201, 'Driver created successfully', {
    id: newDriver._id,
    name: newDriver.fullName,
    email: newDriver.email,
  });
});

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver
};
