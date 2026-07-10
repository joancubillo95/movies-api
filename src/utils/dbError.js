import { AppError } from "./appError.js"

export class DbError extends AppError {
    constructor(originalError) {
        const statusCode = 400
        const message = DbError.mapMessage(originalError)

        super(message, statusCode, originalError)
    }

    static mapMessage(err) {
        switch (err.number) {
            case 515: // Cannot insert NULL
                return "A required field was missing."
            case 547: // Foreign key violation
                return "This record is linked to another and cannot be deleted."
            case 2627: // Unique constraint violation
                return "Duplicate value detected."
            default:
                return "Database error occurred."
        }
    }
}
