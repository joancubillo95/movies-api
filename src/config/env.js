import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().nonoptional(),
    API_KEY: z.string().min(1),
    DB_DRIVER: z.enum(["mssql", "postgres"]),
    JWT_SECRET: z.string().min(10),
    JWT_REFRESH: z.string().min(10)
})

const env = envSchema.parse(process.env)

export const ENV = process.env.NODE_ENV || "development"
export const PORT = Number.parseInt(process.env.PORT) || 3000
export const API_KEY = process.env.API_KEY
export const DB_DRIVER = process.env.DB_DRIVER
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_REFRESH = process.env.JWT_REFRESH
