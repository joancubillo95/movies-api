import "dotenv/config"

import { DB_DRIVER, PORT } from "./config/env.js"
import express, { json } from "express"

import { MssqlDatabase } from "./config/mssqlConnection.js"
import { PgDatabase } from "./config/postgresSqlConnection.js"
import { PostgresErrorMapper } from "./utils/ErrorMappers/postgresErrorMapper.js"
import cors from "cors"
import { corsMiddleware } from "./middlewares/cors.js"
import { createHealthRouter } from "./routes/health.router.js"
import { createLoginRouter } from "./routes/login.router.js"
import { createMovieRouter } from "./routes/movies.router.js"
import { createUsersRouter } from "./routes/users.router.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { limiter } from "./middlewares/trafficLimiter.js"
import { validateApiKey } from "./middlewares/validateApiKey.js"

export const CreateApp = ({ moviesRepository, usersRepository, database }) => {
    const app = express()
    app.disable("x-powered-by")
        .use(corsMiddleware)
        .use(json())
        .use(limiter)
        .use(validateApiKey)
        .use("/", createHealthRouter())
        .use("/login", createLoginRouter({ usersRepository }))
        .use("/users", createUsersRouter({ usersRepository }))
        .use("/movies", createMovieRouter({ moviesRepository }))

        .use(errorHandler)

    const server = app.listen(PORT, () => {
        console.log(`server listening on port http://localhost:${PORT}`)
    })

    const shutdown = async () => {
        console.log("Shutting down...")

        server.close(async () => {
            console.log("Closing database...")
            await database.close()
            process.exit(0)
        })
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
}