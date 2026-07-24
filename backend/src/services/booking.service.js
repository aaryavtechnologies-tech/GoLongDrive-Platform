// src/services/booking.service.js

const Booking = require('../models/Booking.model');
const BookingTimeline = require('../models/BookingTimeline.model');
const { getIO } = require('../config/socket');

/**
 * Generate an auto-increment booking ID: CAB-YYYYMMDD-XXXX
 */
const generateBookingId = async () => {
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`; // YYYYMMDD
  
  // Find the last booking for today to increment the count
  const lastBooking = await Booking.findOne({
    bookingId: new RegExp(`^CAB-${datePrefix}-`)
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (lastBooking && lastBooking.bookingId) {
    const parts = lastBooking.bookingId.split('-');
    if (parts.length === 3) {
      nextSequence = parseInt(parts[2], 10) + 1;
    }
  }

  const sequenceStr = String(nextSequence).padStart(4, '0');
  return `CAB-${datePrefix}-${sequenceStr}`;
};

/**
 * Add an entry to the booking timeline
 * @param {string|ObjectId} bookingId - The MongoDB ObjectId of the booking
 * @param {string} action - Action performed (e.g., 'Booking Created')
 * @param {string} performedBy - User ID or 'Admin'/'System'
 * @param {string} remarks - Additional notes
 */
const addTimelineEntry = async (bookingId, action, performedBy, remarks = '') => {
  try {
    await BookingTimeline.create({
      booking: bookingId,
      action,
      performedBy,
      remarks
    });
  } catch (error) {
    console.error('Failed to create timeline entry:', error);
  }
};

/**
 * Emit a booking event via Socket.io
 * @param {string} event - Event name (e.g., 'booking:created')
 * @param {Object} data - Payload to send
 */
const emitBookingEvent = (event, data) => {
  try {
    const io = getIO();
    io.emit(event, data);
  } catch (error) {
    console.error('Socket.io error:', error.message);
  }
};

/**
 * Handle Driver Rejection / Timeout
 * @param {string} bookingId
 * @param {string} driverId
 * @param {string} reason
 */
const handleDriverRejection = async (bookingId, driverId, reason) => {
  try {
    const Driver = require('../models/Driver.model');
    const b = await Booking.findById(bookingId);
    if (!b || b.rideStatus !== require('../utils/constants').RIDE_STATUS.DRIVER_ASSIGNED) return;
    if (b.driver.toString() !== driverId.toString()) return;

    // Unassign driver
    b.driver = null;
    b.rideStatus = require('../utils/constants').RIDE_STATUS.SEARCHING_DRIVER;
    await b.save();

    await addTimelineEntry(b._id, 'Driver Rejected', driverId, reason);
    emitBookingEvent('driver:rejected', { bookingId: b.bookingId, reason });

    // Free the driver
    await Driver.findByIdAndUpdate(driverId, { availabilityStatus: require('../utils/constants').AVAILABILITY_STATUS.AVAILABLE });

    // Try finding another driver immediately
    autoAssign(bookingId);
  } catch (error) {
    console.error('Rejection handler error:', error);
  }
};

/**
 * Auto-assign a driver to a booking
 * @param {string} bookingId 
 */
const autoAssign = async (bookingId) => {
  try {
    const { RIDE_STATUS, AVAILABILITY_STATUS, DRIVER_STATUS, ONLINE_STATUS } = require('../utils/constants');
    const Driver = require('../models/Driver.model');

    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    // Only assign if currently searching or pending
    if (![RIDE_STATUS.PENDING, RIDE_STATUS.SEARCHING_DRIVER].includes(booking.rideStatus)) {
      return;
    }

    booking.rideStatus = RIDE_STATUS.SEARCHING_DRIVER;
    await booking.save();

    // Match logic: Approved, Online, Available, matching vehicle type
    const query = {
      driverStatus: DRIVER_STATUS.APPROVED,
      onlineStatus: ONLINE_STATUS.ONLINE,
      availabilityStatus: AVAILABILITY_STATUS.AVAILABLE,
      vehicleType: booking.vehicleType
    };

    // Find all matching drivers (ideally we would sort by least bookings/oldest assigned)
    const availableDrivers = await Driver.find(query);

    if (availableDrivers.length === 0) {
      await addTimelineEntry(booking._id, 'Auto Assign Failed', 'System', 'No available drivers found matching criteria');
      return;
    }

    // Sort preference: same city first
    availableDrivers.sort((a, b) => {
      if (a.city === booking.pickupCity && b.city !== booking.pickupCity) return -1;
      if (a.city !== booking.pickupCity && b.city === booking.pickupCity) return 1;
      return 0;
    });

    const selectedDriver = availableDrivers[0];

    // Assign
    booking.driver = selectedDriver._id;
    booking.rideStatus = RIDE_STATUS.DRIVER_ASSIGNED;
    booking.assignedAt = new Date();
    await booking.save();

    selectedDriver.availabilityStatus = AVAILABILITY_STATUS.BUSY;
    await selectedDriver.save();

    await addTimelineEntry(booking._id, 'Driver Assigned', 'System', `Auto-assigned driver ${selectedDriver.fullName}`);
    emitBookingEvent('driver:assigned', { bookingId: booking.bookingId, driverId: selectedDriver._id });

    // Background Timeout: 2 minutes (120,000 ms)
    setTimeout(() => {
      handleDriverRejection(booking._id, selectedDriver._id, 'Timeout: Driver did not respond in 2 minutes');
    }, 120000);

  } catch (error) {
    console.error('Auto Assign error:', error);
  }
};

module.exports = {
  generateBookingId,
  addTimelineEntry,
  emitBookingEvent,
  autoAssign,
  handleDriverRejection
};
