import "dotenv/config"

import { DB_DRIVER, PORT } from "./config/env.js"
import express, { json } from "express"

import { MssqlDatabase } from "./config/mssqlConnection.js"
import { PgDatabase } from "./config/postgresSqlConnection.js"
import { PostgresErrorMapper } from "./utils/ErrorMappers/postgresErrorMapper.js"
import { createHealthRouter } from "./routes/health.router.js"
import { createLoginRouter } from "./routes/login.router.js"
import { createMovieRouter } from "./routes/movies.router.js"
import { createSwaggerDocs } from "./swagger/swagger.docs.js"
import { createUsersRouter } from "./routes/users.router.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { limiter } from "./middlewares/trafficLimiter.js"
import swaggerUi from "swagger-ui-express"
import { validateApiKey } from "./middlewares/validateApiKey.js"

export const CreateApp = ({ moviesRepository, usersRepository, database }) => {
    const apiVers = "/api/v1"
    const app = express()
    const url = `http://localhost:${PORT}`
    app.disable("x-powered-by")
        .use(json())
        .use(limiter)
        .use(validateApiKey)
        .use(apiVers + "/", createHealthRouter())
        .use(apiVers + "/api-docs", swaggerUi.serve, swaggerUi.setup(createSwaggerDocs(url)))
        .use(apiVers + "/login", createLoginRouter({ usersRepository }))
        .use(apiVers + "/users", createUsersRouter({ usersRepository }))
        .use(apiVers + "/movies", createMovieRouter({ moviesRepository }))

        .use(errorHandler)

    const server = app.listen(PORT, () => {
        console.log(`server listening on port ${url}`)
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