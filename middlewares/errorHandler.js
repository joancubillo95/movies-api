import { AppError } from "../utils/appError.js";
import { ENV } from "../config/env.js";

export function errorHandler(
  err,
  req,
  res,
  next
) {
  if (ENV === "development") {
    // console.info("Stack trace: " + err.stack)
    console.error(JSON.stringify(err.originalError))
    return res.status(err.statusCode).json({
      message: err.message,
      originalError: err.originalError
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
