export class AppError extends Error {
    constructor(message, statusCode, originalError, options = {}) {
        super(message)
        this.statusCode = statusCode
        this.originalError = originalError

        this.code = options.code || null
        this.detail = options.detail || null
        this.origin = options.origin || "app"

        Error.captureStackTrace(this, this.constructor)
    }
}