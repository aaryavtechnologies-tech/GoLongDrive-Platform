// src/middleware/apiLogger.middleware.js

const logger = require('../utils/logger');

const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = { ...obj };
  const sensitiveKeys = ['password', 'token', 'authorization', 'newpassword', 'currentpassword', 'otp'];
  
  for (const key in masked) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  return masked;
};

const apiLogger = (req, res, next) => {
  const reqData = {
    query: req.query,
    body: maskSensitiveData(req.body),
  };
  
  logger.info(`[API Request] ${req.method} ${req.originalUrl} - Payload: ${JSON.stringify(reqData)}`);

  // Intercept res.json
  const originalJson = res.json;
  res.json = function (body) {
    logger.info(`[API Response JSON] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Payload: ${JSON.stringify(maskSensitiveData(body))}`);
    return originalJson.call(this, body);
  };

  // Intercept res.send
  const originalSend = res.send;
  res.send = function (body) {
    // Avoid double logging if res.json was already called and forwarded to res.send internally
    // res.json usually calls res.send under the hood. To prevent duplicate logs, we only log res.send if it's a string or buffer 
    // and we haven't already logged it via res.json interceptor. But it's simpler to just let res.json log it and not intercept send 
    // unless the endpoint doesn't use res.json. But most of our endpoints use res.json.
    // We will just do a lightweight log for send if body is a string (e.g. error messages).
    if (typeof body === 'string') {
        logger.info(`[API Response SEND] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Payload: ${body.substring(0, 500)}`);
    }
    return originalSend.call(this, body);
  };

  next();
};

module.exports = apiLogger;
