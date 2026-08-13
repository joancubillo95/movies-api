import { AppError } from "../appError.js";

export class MssqlErrorMapper {
    isDatabaseError = (error) => {
        return error.code === "EREQUEST"
    }
    map(error) {
        if (!this.isDatabaseError(error)) {
            return new AppError(
                "Unexpected error",
                500,
                error
            )
        }
        switch (error.number) {
            case 547:
                return new AppError(
                    "This record is linked to another and cannot be deleted",
                    409,
                    error
                )

            case 2627:
                return new AppError(
                    "Duplicate value detected",
                    409,
                    error
                )

            case 208:
                return new AppError(
                    "The requested database object does not exist",
                    500,
                    error
                )

            default:
                return new AppError(
                    "Database error occurred",
                    500,
                    error
                )
        }
    }
}