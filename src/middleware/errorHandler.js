export default function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Default error
  let error = {
    message: "Internal Server Error",
    status: 500,
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error.message = err.message;
    error.status = 400;
  } else if (err.name === "CastError") {
    error.message = "Invalid ID format";
    error.status = 400;
  } else if (err.code === 11000) {
    error.message = "Duplicate field value";
    error.status = 400;
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
