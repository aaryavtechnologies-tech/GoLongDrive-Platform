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

// ── XSS sanitise middleware (replaces deprecated xss-clean) ──────────────────
const xssSanitize = (req, res, next) => {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') return xss(val);
    if (val && typeof val === 'object') {
      Object.keys(val).forEach((key) => { val[key] = sanitizeValue(val[key]); });
    }
    return val;
  };
  if (req.body)  req.body  = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
};

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────

// Helmet sets secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow static uploads
  })
);

// CORS — whitelist only the client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
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

app.use('/api/v1', routes);

// ── Error Handling ────────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
