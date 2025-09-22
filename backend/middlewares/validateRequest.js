// backend/middlewares/validateRequest.js
const { validationResult } = require('express-validator');

module.exports = function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ param: e.param, msg: e.msg }));
    // LOG to server console for quick debugging
    console.warn('Validation failed for', req.method, req.originalUrl, 'payload:', req.body, 'errors:', formatted);
    return res.status(400).json({ success: false, errors: formatted });
  }
  next();
};
