// backend/middlewares/errorMiddleware.js
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ success:false, message: err.message || 'Server error' });
};
