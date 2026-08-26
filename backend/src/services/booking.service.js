// src/services/booking.service.js

const Booking = require('../models/Booking.model');
const BookingTimeline = require('../models/BookingTimeline.model');
const { getIO, getDriverSocket } = require('../config/socket');

const assignmentTimers = new Map();

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
 * Broadcast ride request to all online eligible drivers
 * @param {string} bookingId 
 */
const broadcastRideRequest = async (bookingId) => {
  try {
    const { RIDE_STATUS, AVAILABILITY_STATUS, DRIVER_STATUS, ONLINE_STATUS } = require('../utils/constants');
    const Driver = require('../models/Driver.model');

    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    if (![RIDE_STATUS.PENDING, RIDE_STATUS.SEARCHING_DRIVER].includes(booking.rideStatus)) {
      return;
    }

    booking.rideStatus = RIDE_STATUS.SEARCHING_DRIVER;
    await booking.save();

    const query = {
      driverStatus: DRIVER_STATUS.APPROVED,
      onlineStatus: ONLINE_STATUS.ONLINE,
      availabilityStatus: AVAILABILITY_STATUS.AVAILABLE,
      'vehicle.type': booking.vehicleType
    };

    const availableDrivers = await Driver.find(query);

    if (availableDrivers.length === 0) {
      await addTimelineEntry(booking._id, 'Broadcast Failed', 'System', 'No online drivers found matching criteria. Falling back to random assignment.');
      return randomFallbackAssign(booking._id);
    }

    await addTimelineEntry(booking._id, 'Ride Broadcasted', 'System', `Broadcasted to ${availableDrivers.length} online drivers`);
    
    const io = getIO();
    availableDrivers.forEach(driver => {
      const socketId = getDriverSocket(driver._id);
      if (socketId) {
        io.to(socketId).emit('ride:request', { booking });
      }
    });

    // 2 Minute Timer
    const timer = setTimeout(async () => {
      assignmentTimers.delete(booking._id.toString());
      const b = await Booking.findById(booking._id);
      if (b && b.rideStatus === RIDE_STATUS.SEARCHING_DRIVER) {
        await addTimelineEntry(b._id, 'Broadcast Timeout', 'System', 'No driver accepted in 2 minutes. Falling back to random assignment.');
        randomFallbackAssign(b._id);
      }
    }, 120000);

    assignmentTimers.set(booking._id.toString(), timer);

  } catch (error) {
    console.error('Broadcast error:', error);
  }
};

/**
 * Fallback to assigning a random eligible driver (even offline), checking date conflicts
 */
const randomFallbackAssign = async (bookingId) => {
  try {
    const { RIDE_STATUS, AVAILABILITY_STATUS, DRIVER_STATUS, ONLINE_STATUS } = require('../utils/constants');
    const Driver = require('../models/Driver.model');

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.rideStatus !== RIDE_STATUS.SEARCHING_DRIVER) return;

    const startOfDay = new Date(booking.pickupDate);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(booking.pickupDate);
    endOfDay.setHours(23,59,59,999);

    const conflictingBookings = await Booking.find({
      pickupDate: { $gte: startOfDay, $lte: endOfDay },
      rideStatus: { $nin: [RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN] },
      driver: { $ne: null }
    }).select('driver');

    const busyDriverIds = conflictingBookings.map(b => b.driver);

    const query = {
      _id: { $nin: busyDriverIds },
      driverStatus: DRIVER_STATUS.APPROVED,
      'vehicle.type': booking.vehicleType
    };

    const eligibleDrivers = await Driver.find(query);

    if (eligibleDrivers.length === 0) {
      await addTimelineEntry(booking._id, 'Fallback Assign Failed', 'System', 'No eligible drivers (even offline) found for this date.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * eligibleDrivers.length);
    const selectedDriver = eligibleDrivers[randomIndex];

    booking.driver = selectedDriver._id;
    booking.rideStatus = RIDE_STATUS.DRIVER_ASSIGNED;
    booking.assignedAt = new Date();
    await booking.save();

    if (selectedDriver.onlineStatus === ONLINE_STATUS.ONLINE) {
      selectedDriver.availabilityStatus = AVAILABILITY_STATUS.BUSY;
      await selectedDriver.save();
    }

    await addTimelineEntry(booking._id, 'Driver Assigned', 'System', `Fallback random assigned to driver ${selectedDriver.fullName}`);
    emitBookingEvent('driver:assigned', { bookingId: booking.bookingId, driverId: selectedDriver._id });

  } catch (error) {
    console.error('Random Assign error:', error);
  }
};

const clearAssignmentTimer = (bookingId) => {
  const timer = assignmentTimers.get(bookingId.toString());
  if (timer) {
    clearTimeout(timer);
    assignmentTimers.delete(bookingId.toString());
  }
};

module.exports = {
  generateBookingId,
  addTimelineEntry,
  emitBookingEvent,
  broadcastRideRequest,
  randomFallbackAssign,
  clearAssignmentTimer,
  handleDriverRejection
};
