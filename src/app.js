import "dotenv/config"

import express, { json } from "express"

import { PORT } from "./config/env.js"
import { createHealthRouter } from "./routes/health.router.js"
import { createMovieRouter } from "./routes/movies.router.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { limiter } from "./middlewares/trafficLimiter.js"
import { validateApiKey } from "./middlewares/validateApiKey.js"

export const CreateApp = ({ movieModel }) => {
    const app = express()
    app.disable("x-powered-by")
        .use(json())
        .use(limiter)
        .use(validateApiKey)
        .use("/movies", createMovieRouter({ movieModel }))
        .use("/", createHealthRouter())
        .use(errorHandler)

    app.listen(PORT, () => {
        console.log(`server listening on port http://localhost:${PORT}`)
    })
}