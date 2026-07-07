import { AppError } from "../utils/appError.js";
import { ENV } from "../config/env.js";

export function errorHandler(
  err,
  req,
  res,
  next
) {
  if (ENV === "development") {
    console.info("Stack: " + err.stack)
    console.error("Original error: " + err.originalError)
    // Original Error object cannot be sent in res.json()
    // because Error instances are not fully serializable.
    return res.status(err.statusCode).json({
      message: err.message + ". Check logs for additional information.",
    })
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({ message: err.message })
    } else {
      res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
}
