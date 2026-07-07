import dotenv from "dotenv"

dotenv.config()

export const ENV = process.env.NODE_ENV || "development"
export const PORT = Number.parseInt(process.env.PORT) || 3000