// src/services/booking.service.js

const Booking = require('../models/Booking.model');
const BookingTimeline = require('../models/BookingTimeline.model');
const { getIO, getDriverSocket, getCustomerSocket } = require('../config/socket');

const assignmentTimers = new Map();

// ── Vehicle Type Normalisation ────────────────────────────────────────────────
// Normalise vehicle type strings so "Toyota Innova", "Innova Crysta", "innova"
// all map to the same canonical key. This fixes the silent zero-driver query bug.
const VEHICLE_TYPE_MAP = {
  // Sedan variants
  sedan: 'Sedan',
  swift: 'Sedan',
  dzire: 'Sedan',
  'honda city': 'Sedan',
  hyundai: 'Sedan',
  verna: 'Sedan',
  // SUV variants
  suv: 'SUV',
  creta: 'SUV',
  brezza: 'SUV',
  'scorpio n': 'SUV',
  scorpio: 'SUV',
  'thar': 'SUV',
  // Innova variants
  innova: 'Innova',
  'innova crysta': 'Innova',
  'toyota innova': 'Innova',
  crysta: 'Innova',
  // Tempo/Traveller
  tempo: 'Tempo Traveller',
  traveller: 'Tempo Traveller',
  'tempo traveller': 'Tempo Traveller',
  // Luxury
  luxury: 'Luxury',
  bmw: 'Luxury',
  mercedes: 'Luxury',
  audi: 'Luxury',
  // Hatchback
  hatchback: 'Hatchback',
  wagonr: 'Hatchback',
  'wagon r': 'Hatchback',
  alto: 'Hatchback',
};

/**
 * Normalise a raw vehicle type string from either booking or driver profile
 * to a canonical category that can be compared.
 * E.g., "Toyota Innova Crysta" → "Innova"
 * @param {string} raw
 * @returns {string}
 */
const normaliseVehicleType = (raw) => {
  if (!raw) return '';
  const lower = raw.trim().toLowerCase();

  // Exact match first
  if (VEHICLE_TYPE_MAP[lower]) return VEHICLE_TYPE_MAP[lower];

  // Partial / keyword match
  for (const [key, canonical] of Object.entries(VEHICLE_TYPE_MAP)) {
    if (lower.includes(key)) return canonical;
  }

  // Capitalise original as fallback — at least ensure consistent casing
  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
};

// ─────────────────────────────────────────────────────────────────────────────

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
 * Emit a booking event via Socket.io to a SPECIFIC socket (targeted).
 * Falls back to broadcast only when no socketId is provided (for legacy callers).
 * @param {string} event - Event name
 * @param {Object} data - Payload to send
 * @param {string} [socketId] - Target socket ID (optional — omit to broadcast)
 */
const emitBookingEvent = (event, data, socketId = null) => {
  try {
    const io = getIO();
    if (socketId) {
      io.to(socketId).emit(event, data);
    } else {
      // Fallback broadcast — only used for system-wide events (admin panel, etc.)
      io.emit(event, data);
    }
  } catch (error) {
    console.error('Socket.io error:', error.message);
  }
};

/**
 * Notify a specific customer that a driver has been assigned to their booking.
 * Emits booking:driver_assigned with full driver + booking details.
 * @param {ObjectId} customerId
 * @param {Object} booking - The populated booking document
 * @param {Object} driver - The driver document
 */
const notifyCustomerDriverAssigned = async (customerId, booking, driver) => {
  try {
    const customerSocketId = getCustomerSocket(customerId._id ? customerId._id : customerId);
    if (customerSocketId) {
      const io = getIO();
      io.to(customerSocketId).emit('booking:driver_assigned', {
        bookingId: booking.bookingId,
        rideStatus: booking.rideStatus,
        driver: {
          id: driver._id,
          fullName: driver.fullName,
          phoneNumber: driver.phoneNumber,
          profileImage: driver.profileImage,
          vehicle: driver.vehicle,
          rating: driver.rating || null,
        },
      });
      console.log(`📲  Notified customer ${customerId} — driver assigned: ${driver.fullName}`);
    } else {
      console.log(`⚠️  Customer ${customerId} not connected via socket — they will poll`);
    }
  } catch (error) {
    console.error('Customer notify error:', error);
  }
};

/**
 * Notify all OTHER drivers who received the broadcast that the ride is taken.
 * They show "Missed — Another driver accepted" on their screen.
 * @param {Array} driverIds - All driver IDs who were sent the original broadcast
 * @param {string} winnerDriverId - The driver who accepted
 * @param {string} bookingIdStr - The booking's bookingId string
 */
const notifyOtherDriversRideTaken = (driverIds, winnerDriverId, bookingIdStr) => {
  try {
    const io = getIO();
    driverIds.forEach((dId) => {
      if (dId.toString() === winnerDriverId.toString()) return;
      const sockId = getDriverSocket(dId);
      if (sockId) {
        io.to(sockId).emit('ride:request_taken', { bookingId: bookingIdStr });
      }
    });
  } catch (error) {
    console.error('notifyOtherDriversRideTaken error:', error);
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
    if (b.driver && b.driver.toString() !== driverId.toString()) return;

    // Unassign driver
    b.driver = null;
    b.rideStatus = require('../utils/constants').RIDE_STATUS.SEARCHING_DRIVER;
    await b.save();

    await addTimelineEntry(b._id, 'Driver Rejected', driverId, reason);
    emitBookingEvent('driver:rejected', { bookingId: b.bookingId, reason });

    // Free the driver
    await Driver.findByIdAndUpdate(driverId, { availabilityStatus: require('../utils/constants').AVAILABILITY_STATUS.AVAILABLE });

    // Try finding another driver via broadcast first, then fall back
    await broadcastRideRequest(b._id);
  } catch (error) {
    console.error('Rejection handler error:', error);
  }
};

/**
 * Broadcast ride request to all online eligible drivers
 * @param {string|ObjectId} bookingId
 */
const broadcastRideRequest = async (bookingId) => {
  try {
    const { RIDE_STATUS, AVAILABILITY_STATUS, DRIVER_STATUS, ONLINE_STATUS } = require('../utils/constants');
    const Driver = require('../models/Driver.model');

    const booking = await Booking.findById(bookingId).populate('customer', 'fullName phoneNumber profileImage');
    if (!booking) return;

    if (![RIDE_STATUS.PENDING, RIDE_STATUS.SEARCHING_DRIVER].includes(booking.rideStatus)) {
      return;
    }

    booking.rideStatus = RIDE_STATUS.SEARCHING_DRIVER;
    await booking.save();

    // Normalise vehicle type from booking to compare fairly
    const normalised = normaliseVehicleType(booking.vehicleType);

    // Fetch all approved + online + available drivers
    const query = {
      driverStatus: DRIVER_STATUS.APPROVED,
      onlineStatus: ONLINE_STATUS.ONLINE,
      availabilityStatus: AVAILABILITY_STATUS.AVAILABLE,
    };

    const allOnlineDrivers = await Driver.find(query);

    // Filter by normalised vehicle type (flexible matching)
    const availableDrivers = allOnlineDrivers.filter((d) => {
      const dType = normaliseVehicleType(d.vehicle?.type);
      return dType.toLowerCase() === normalised.toLowerCase();
    });

    if (availableDrivers.length === 0) {
      await addTimelineEntry(booking._id, 'Broadcast Failed', 'System',
        `No online drivers found for vehicle type "${booking.vehicleType}" (normalised: "${normalised}"). Falling back.`);
      return randomFallbackAssign(booking._id);
    }

    await addTimelineEntry(booking._id, 'Ride Broadcasted', 'System',
      `Broadcasted to ${availableDrivers.length} online drivers for type "${normalised}"`);
    
    const io = getIO();
    // Store which drivers received this broadcast so we can notify them when taken
    const broadcastedDriverIds = [];

    availableDrivers.forEach((driver) => {
      const socketId = getDriverSocket(driver._id);
      if (socketId) {
        io.to(socketId).emit('ride:request', { booking });
        broadcastedDriverIds.push(driver._id);
        console.log(`📤  Sent ride:request to driver ${driver.fullName} (${driver._id})`);
      }
    });

    // Store broadcasted driver IDs in memory for this booking (for race-condition cleanup)
    if (!global._broadcastMap) global._broadcastMap = new Map();
    global._broadcastMap.set(booking._id.toString(), broadcastedDriverIds);

    // 2-Minute Timer — if no one accepts, fall back to random assign
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
 * Fallback: assign a random eligible driver (even offline), checking date conflicts.
 * FIXED: now emits ride:request to the specific assigned driver's socket.
 * FIXED: now notifies the customer via socket.
 * @param {string|ObjectId} bookingId
 */
const randomFallbackAssign = async (bookingId) => {
  try {
    const { RIDE_STATUS, AVAILABILITY_STATUS, DRIVER_STATUS, ONLINE_STATUS } = require('../utils/constants');
    const Driver = require('../models/Driver.model');

    const booking = await Booking.findById(bookingId).populate('customer', 'fullName phoneNumber profileImage');
    if (!booking || booking.rideStatus !== RIDE_STATUS.SEARCHING_DRIVER) return;

    const startOfDay = new Date(booking.pickupDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(booking.pickupDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBookings = await Booking.find({
      pickupDate: { $gte: startOfDay, $lte: endOfDay },
      rideStatus: { $nin: [RIDE_STATUS.CANCELLED_BY_CUSTOMER, RIDE_STATUS.CANCELLED_BY_DRIVER, RIDE_STATUS.CANCELLED_BY_ADMIN] },
      driver: { $ne: null }
    }).select('driver');

    const busyDriverIds = conflictingBookings.map((b) => b.driver);

    // Normalise vehicle type for flexible matching
    const normalised = normaliseVehicleType(booking.vehicleType);

    const allApprovedDrivers = await Driver.find({
      _id: { $nin: busyDriverIds },
      driverStatus: DRIVER_STATUS.APPROVED,
    });

    // Filter by vehicle type
    const eligibleDrivers = allApprovedDrivers.filter((d) => {
      const dType = normaliseVehicleType(d.vehicle?.type);
      return dType.toLowerCase() === normalised.toLowerCase();
    });

    if (eligibleDrivers.length === 0) {
      await addTimelineEntry(booking._id, 'Fallback Assign Failed', 'System',
        `No eligible drivers (even offline) found for vehicle type "${normalised}" on this date.`);
      // Notify customer that no driver is available right now
      if (booking.customer) {
        const custSocketId = getCustomerSocket(booking.customer);
        if (custSocketId) {
          const io = getIO();
          io.to(custSocketId).emit('booking:no_driver', {
            bookingId: booking.bookingId,
            message: 'No drivers available right now. Our team will assign one shortly.',
          });
        }
      }
      return;
    }

    const randomIndex = Math.floor(Math.random() * eligibleDrivers.length);
    const selectedDriver = eligibleDrivers[randomIndex];

    booking.driver = selectedDriver._id;
    booking.rideStatus = RIDE_STATUS.DRIVER_ASSIGNED;
    booking.assignedAt = new Date();
    await booking.save();

    // If the driver is online, mark as busy
    if (selectedDriver.onlineStatus === ONLINE_STATUS.ONLINE) {
      selectedDriver.availabilityStatus = AVAILABILITY_STATUS.BUSY;
      await selectedDriver.save();

      // Emit ride:request to the specific assigned driver's socket (FIXED BUG 3)
      const driverSocketId = getDriverSocket(selectedDriver._id);
      if (driverSocketId) {
        const io = getIO();
        io.to(driverSocketId).emit('ride:request', { booking });
        console.log(`📤  [Fallback] Sent ride:request to driver ${selectedDriver.fullName}`);
      }
    }

    await addTimelineEntry(booking._id, 'Driver Assigned', 'System',
      `Fallback random assigned to driver ${selectedDriver.fullName} (${selectedDriver._id})`);

    // ── Notify customer in real time (NEW) ──────────────────────────────────
    if (booking.customer) {
      const customerId = booking.customer._id ? booking.customer._id : booking.customer;
      await notifyCustomerDriverAssigned(customerId, booking, selectedDriver);
    }

    // Legacy admin-panel broadcast (no customer/driver targeting)
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
  handleDriverRejection,
  notifyCustomerDriverAssigned,
  notifyOtherDriversRideTaken,
  normaliseVehicleType,
};
