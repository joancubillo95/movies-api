import "dotenv/config";

import pg from "pg"

const { Pool } = pg

const poolConfig = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_HOST),
    database: process.env.DB_DATABASE,
})

const pool = await poolConfig.connect()

export { pool }
