import { json } from "zod";
import { AppError } from "../utils/appError.js";

export function errorHandler(
  err,
  req,
  res,
  next
) {

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      details: err.detail,
      source: err.source
    })
  }


  // Default fallback
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message,
  });
}
