export const errorHandler = (err, req, res, next) => {
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
};
