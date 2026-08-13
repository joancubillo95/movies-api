import "dotenv/config";

import pg from "pg"

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_HOST),
    database: process.env.DB_DATABASE,
}

export class PgDatabase {
    constructor() {
        this.pool = null
    }

    getPool = async () => {
        if (!this.pool) {
            this.pool = new pg.Pool(config)
        }
        return this.pool
    }

    close = async () => {
        if (this.pool) {
            this.pool.end()
            this.pool = null
        }
    }
}
