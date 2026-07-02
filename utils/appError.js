export class AppError extends Error {
    constructor(message, statusCode, options = {}) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true

        //Optional info for db errors
        this.code = options.code || null
        this.detail = options.detail || null
        this.source = options.source || 'app' //default from app if not specified

        Error.captureStackTrace(this, this.constructor)
    }
}