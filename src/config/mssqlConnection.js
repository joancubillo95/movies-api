import "dotenv/config"

import sql from "mssql"

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 2,
        min: 0,
        idleTimeoutMillis: 20000
    }
};

export class MssqlDatabase {
    constructor() {
        this.pool = null
        this.poolPromise = null
    }

    getPool = async () => {
        if (this.pool) {
            return this.pool
        }

        if (!this.poolPromise) {
            this.poolPromise = new sql.ConnectionPool(config)
                .connect()
                .then(pool => {
                    this.pool = pool
                    return pool
                })
        }

        return this.poolPromise
    }

    createTransaction = async () => {
        const pool = this.pool ?? await this.getPool()
        return new sql.Transaction(pool)
    }

    close = async () => {
        if (this.pool) {
            await this.pool.close()
            this.pool = null
        }

    }
}
