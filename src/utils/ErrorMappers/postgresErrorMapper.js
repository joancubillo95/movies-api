import { AppError } from "../appError";

export class PostgresErrorMapper {
    #isDatabaseError = (error) => {
        return error.severity === "ERROR"
    }
    map = (error) => {
        if (!this.#isDatabaseError(error)) {
            return new AppError(
                "Unexpected error",
                500,
                error
            )
        }
        switch (error.code) {
            case "23502":
                return new AppError(
                    "A required field was missing",
                    400,
                    error
                );

            case "23503":
                return new AppError(
                    "This record is linked to another and cannot be deleted",
                    409,
                    error
                );

            case "23505":
                return new AppError(
                    "Duplicate value detected",
                    409,
                    error
                );

            default:
                return new AppError(
                    "Database error occurred",
                    500,
                    error
                );

        }
    }
}
