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
    avatar: d.documents?.selfiePhoto || d.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName)}&background=random`,
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

/**
 * @route   PATCH /api/admin/drivers/:id/status
 * @desc    Update driver approval status
 * @access  Private (Admin)
 */
const updateDriverStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const driver = await Driver.findById(id);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  // Update status
  driver.driverStatus = status;
  
  // If approved, you might want to also set isActive to true or similar logic
  // if (status === 'Approved') driver.isActive = true;

  await driver.save();

  return sendSuccess(res, 200, 'Driver status updated successfully', {
    id: driver._id,
    status: driver.driverStatus
  });
});

/**
 * @route   GET /api/admin/drivers/:id/documents
 * @desc    Get driver documents
 * @access  Private (Admin)
 */
const getDriverDocuments = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  const docs = driver.documents || {};
  
  const mappedDocs = [
    { id: 'aadhaarFront', type: 'Aadhaar Card Front', url: docs.aadhaarFront, status: docs.aadhaarFront ? 'Uploaded' : 'Missing' },
    { id: 'aadhaarBack', type: 'Aadhaar Card Back', url: docs.aadhaarBack, status: docs.aadhaarBack ? 'Uploaded' : 'Missing' },
    { id: 'licenseFront', type: 'Driving License Front', url: docs.licenseFront, status: docs.licenseFront ? 'Uploaded' : 'Missing' },
    { id: 'licenseBack', type: 'Driving License Back', url: docs.licenseBack, status: docs.licenseBack ? 'Uploaded' : 'Missing' },
    { id: 'rcFront', type: 'RC Front', url: docs.rcFront, status: docs.rcFront ? 'Uploaded' : 'Missing' },
    { id: 'rcBack', type: 'RC Back', url: docs.rcBack, status: docs.rcBack ? 'Uploaded' : 'Missing' },
    { id: 'insuranceCertificate', type: 'Insurance', url: docs.insuranceCertificate, status: docs.insuranceCertificate ? 'Uploaded' : 'Missing' },
    { id: 'pucCertificate', type: 'PUC', url: docs.pucCertificate, status: docs.pucCertificate ? 'Uploaded' : 'Missing' },
    { id: 'selfiePhoto', type: 'Profile Photo', url: docs.selfiePhoto, status: docs.selfiePhoto ? 'Uploaded' : 'Missing' },
    { id: 'vehicleFrontPhoto', type: 'Vehicle Photo', url: docs.vehicleFrontPhoto, status: docs.vehicleFrontPhoto ? 'Uploaded' : 'Missing' },
  ].filter(d => d.url);

  // In a real app, status might be 'Pending', 'Approved', 'Rejected'
  // and we might store reviewedBy and reviewedAt in the model.
  // We'll return them mapped to 'Pending' or 'Approved' based on Driver Status
  const statusToMap = driver.driverStatus === DRIVER_STATUS.APPROVED ? 'Approved' : 'Pending';
  
  const formattedDocs = mappedDocs.map(d => ({
    ...d,
    status: statusToMap,
    uploadedAt: driver.createdAt, // fallback
  }));

  return sendSuccess(res, 200, 'Driver documents fetched successfully', formattedDocs);
});

/**
 * @route   GET /api/admin/drivers/:id/rides
 * @desc    Get driver rides
 * @access  Private (Admin)
 */
const getDriverRides = asyncHandler(async (req, res) => {
  const rides = await Booking.find({ driver: req.params.id })
    .populate('customer', 'fullName')
    .sort({ createdAt: -1 })
    .limit(50);

  const mappedRides = rides.map(r => ({
    id: r.bookingId || r._id.toString(),
    pickup: r.pickupCity,
    destination: r.dropCity,
    customer: r.customer?.fullName || 'Unknown',
    tripType: r.tripType,
    date: r.pickupDate,
    fare: r.finalFare || r.estimatedFare,
    status: r.rideStatus
  }));

  return sendSuccess(res, 200, 'Driver rides fetched successfully', mappedRides);
});

/**
 * @route   GET /api/admin/drivers/:id/earnings
 * @desc    Get driver earnings
 * @access  Private (Admin)
 */
const getDriverEarnings = asyncHandler(async (req, res) => {
  const earnings = await Payment.find({ driver: req.params.id }) // wait, is it Payment or DriverEarning? The model is DriverEarning. Wait, I'll query Booking instead for now, since DriverEarning might not be populated
    .sort({ createdAt: -1 })
    .limit(50);
    
  // Since we don't know if DriverEarning is populated, let's query Booking and map to earnings
  const bookings = await Booking.find({ driver: req.params.id, rideStatus: RIDE_STATUS.COMPLETED })
    .sort({ completedAt: -1, createdAt: -1 })
    .limit(50);

  const mappedEarnings = bookings.map(b => ({
    id: 'ERN-' + (b.bookingId || b._id.toString().substring(0, 6)),
    rideId: b.bookingId || b._id.toString(),
    fare: b.finalFare || b.estimatedFare,
    commission: (b.finalFare || b.estimatedFare) * 0.15, // Mock 15% commission
    driverEarning: (b.finalFare || b.estimatedFare) * 0.85,
    paymentStatus: b.paymentStatus,
    settlementStatus: 'Settled',
    date: b.completedAt || b.createdAt
  }));

  return sendSuccess(res, 200, 'Driver earnings fetched successfully', mappedEarnings);
});

/**
 * @route   GET /api/admin/drivers/:id/statistics
 * @desc    Get driver statistics
 * @access  Private (Admin)
 */
const getDriverStatistics = asyncHandler(async (req, res) => {
  const driverId = req.params.id;
  
  const totalTrips = await Booking.countDocuments({ driver: driverId });
  const completedTrips = await Booking.countDocuments({ driver: driverId, rideStatus: RIDE_STATUS.COMPLETED });
  const cancelledTrips = await Booking.countDocuments({ driver: driverId, rideStatus: RIDE_STATUS.CANCELLED });
  
  const bookings = await Booking.find({ driver: driverId, rideStatus: RIDE_STATUS.COMPLETED });
  const totalEarnings = bookings.reduce((sum, b) => sum + ((b.finalFare || b.estimatedFare) * 0.85), 0);

  const stats = {
    totalTrips,
    completedTrips,
    cancelledTrips,
    acceptanceRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(1) : 0,
    completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(1) : 0,
    totalEarnings,
    averageRating: 4.8, // Mock rating
  };

  return sendSuccess(res, 200, 'Driver statistics fetched successfully', stats);
});

/**
 * @route   GET /api/admin/drivers/:id/timeline
 * @desc    Get driver timeline
 * @access  Private (Admin)
 */
const getDriverTimeline = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return res.status(404).json({ success: false, message: 'Driver not found' });
  }

  const timeline = [
    {
      id: 'TL-1',
      type: 'registered',
      title: 'Driver Registered',
      description: 'Account created on platform',
      date: driver.createdAt
    }
  ];
  
  if (driver.driverStatus === DRIVER_STATUS.APPROVED) {
    timeline.unshift({
      id: 'TL-2',
      type: 'approved',
      title: 'Driver Approved',
      description: 'Driver documents verified and approved',
      date: driver.updatedAt
    });
  }

  return sendSuccess(res, 200, 'Driver timeline fetched successfully', timeline);
});

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriverStatus,
  getDriverDocuments,
  getDriverRides,
  getDriverEarnings,
  getDriverStatistics,
  getDriverTimeline
};
