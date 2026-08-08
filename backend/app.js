// backend/app.js
// Express application factory — all middleware, routes, and Swagger wired here.

require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp          = require('hpp');
const path         = require('path');
const swaggerUi    = require('swagger-ui-express');
const xss          = require('xss');
const logger       = require('./src/utils/logger');

const routes               = require('./src/routes');
const swaggerSpec          = require('./docs/swagger');
const { notFoundHandler, globalErrorHandler } = require('./src/middleware/error.middleware');

// ── XSS sanitise middleware ──────────────────
const xssSanitize = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') return xss(val);
    if (val && typeof val === 'object') {
      Object.keys(val).forEach((key) => { val[key] = sanitizeValue(val[key]); });
    }
    return val;
  };
  
  // Express 5 strictly enforces req.query as a getter. 
  // We must mutate the objects in-place rather than replacing them entirely.
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => req.body[key] = sanitizeValue(req.body[key]));
  }
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => req.query[key] = sanitizeValue(req.query[key]));
  }
  next();
};

const app = express();

// Trust the first proxy so express-rate-limit works behind Nginx/Cloudflare
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────────────────────

// Helmet sets secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow static uploads
  })
);

// CORS — dynamic configuration for VPS and mobile apps
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter — 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/v1', globalLimiter);

// Stricter limiter for auth endpoints — 10 per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/v1/customer/login',          authLimiter);
app.use('/api/v1/customer/register',       authLimiter);
app.use('/api/v1/customer/forgot-password', authLimiter);
app.use('/api/v1/driver/login',            authLimiter);
app.use('/api/v1/driver/register',         authLimiter);
app.use('/api/v1/driver/forgot-password',  authLimiter);
app.use('/api/v1/admin/login',             authLimiter);

// ── Request parsing ───────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Sanitisation ──────────────────────────────────────────────────────────────

// Prevent NoSQL injection (strips $ and . from keys)
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xssSanitize);

// Prevent HTTP parameter pollution
app.use(hpp());

// ── Logging ───────────────────────────────────────────────────────────────────

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: (message) => logger.info(message.trim()) } }));

// ── Compression ───────────────────────────────────────────────────────────────

app.use(compression());

// ── Static file serving — uploaded images ────────────────────────────────────

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    etag: true,
  })
);

// ── Swagger UI ────────────────────────────────────────────────────────────────

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Taxi Booking API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: { persistAuthorization: true },
  })
);

// JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── API Routes ────────────────────────────────────────────────────────────────

// Health check / root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the GoLongDrive API',
    version: '1.0.0',
    status: 'online'
  });
});

app.use('/api/v1', routes);

// ── Error Handling ────────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
