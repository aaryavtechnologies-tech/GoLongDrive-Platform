// backend/docs/swagger.js
// OpenAPI 3.0 spec configuration for swagger-jsdoc + swagger-ui-express.

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Long Distance Taxi Booking API',
      version: '1.0.0',
      description: 'API documentation for the Long Distance Taxi Booking Platform (Phase 4)',
      contact: {
        name: 'Long Distance Taxi Team',
        email: 'support@taxiapp.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
        scheme: 'bearer',
          bearerFormat: 'JWT',
            description: 'Enter your access token',
        },
  },
  schemas: {
    // ── Success Response ───────────────────────────────────────────────────
    SuccessResponse: {
      type: 'object',
        properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operation successful' },
        data: { type: 'object' },
      },
    },

    // ── Error Response ─────────────────────────────────────────────────────
    ErrorResponse: {
      type: 'object',
        properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Something went wrong' },
        errors: {
          type: 'array',
            items: {
            type: 'object',
              properties: {
              field: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },

    // ── Admin ──────────────────────────────────────────────────────────────
    Admin: {
      type: 'object',
        properties: {
        id: { type: 'string', example: '64a0f1c2b1d2e3f4a5b6c7d8' },
        name: { type: 'string', example: 'Super Admin' },
        email: { type: 'string', example: 'admin@taxiapp.com' },
        role: { type: 'string', example: 'admin' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // ── Customer ───────────────────────────────────────────────────────────
    Customer: {
      type: 'object',
        properties: {
        id: { type: 'string', example: '64a0f1c2b1d2e3f4a5b6c7d9' },
        fullName: { type: 'string', example: 'Ravi Kumar' },
        email: { type: 'string', example: 'ravi@example.com' },
        phoneNumber: { type: 'string', example: '9876543210' },
        profileImage: { type: 'string', nullable: true, example: 'uploads/profile/abc.jpg' },
        emailVerified: { type: 'boolean', example: false },
        role: { type: 'string', example: 'customer' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // ── Driver ─────────────────────────────────────────────────────────────
    Driver: {
      type: 'object',
        properties: {
        id: { type: 'string', example: '64a0f1c2b1d2e3f4a5b6c7da' },
        fullName: { type: 'string', example: 'Arjun Singh' },
        email: { type: 'string', example: 'arjun@example.com' },
        phoneNumber: { type: 'string', example: '9123456789' },
        profileImage: { type: 'string', nullable: true },
        driverStatus: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
        onlineStatus: { type: 'string', enum: ['offline', 'online'], example: 'offline' },
        availabilityStatus: { type: 'string', enum: ['available', 'busy'], example: 'available' },
        emailVerified: { type: 'boolean', example: false },
        role: { type: 'string', example: 'driver' },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // ── Booking ────────────────────────────────────────────────────────────
    Booking: {
      type: 'object',
        properties: {
        id: { type: 'string', example: '64a0f1c2b1d2e3f4a5b6c7db' },
        bookingId: { type: 'string', example: 'CAB-20260723-0001' },
        customer: { type: 'string', example: '64a0f1c2b1d2e3f4a5b6c7d9' },
        driver: { type: 'string', nullable: true },
        pickupAddress: { type: 'string', example: '123 MG Road' },
        pickupCity: { type: 'string', example: 'Mumbai' },
        pickupState: { type: 'string', example: 'Maharashtra' },
        pickupPincode: { type: 'string', example: '400001' },
        dropAddress: { type: 'string', example: '45FC FC Road' },
        dropCity: { type: 'string', example: 'Pune' },
        dropState: { type: 'string', example: 'Maharashtra' },
        dropPincode: { type: 'string', example: '411004' },
        tripType: { type: 'string', example: 'One Way' },
        pickupDate: { type: 'string', format: 'date-time' },
        pickupTime: { type: 'string', example: '10:30 AM' },
        vehicleType: { type: 'string', example: 'Sedan' },
        numberOfPassengers: { type: 'number', example: 2 },
        estimatedFare: { type: 'number', example: 1500 },
        rideStatus: { type: 'string', example: 'Pending' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },

    // ── Token Pair ─────────────────────────────────────────────────────────
    TokenPair: {
      type: 'object',
        properties: {
        accessToken: {
          type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
      },
    },
  },
},
  },

apis: [
  `${__dirname}/../src/routes/*.js`,
],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
