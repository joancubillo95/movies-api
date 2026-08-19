import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().nonoptional(),
    API_KEY: z.string().min(1),
    DB_DRIVER: z.enum(["mssql", "postgres"])
})

const env = envSchema.parse(process.env)

export const ENV = process.env.NODE_ENV || "development"
export const PORT = Number.parseInt(process.env.PORT) || 3000
export const API_KEY = process.env.API_KEY
export const DB_DRIVER = process.env.DB_DRIVER
export const JWT_SECRET = process.env.JWT_SECRET
