import "dotenv/config"

import express, { json } from "express"

import { MoviesModel } from "./models/movies.model.js"
import { PORT } from "./config/env.js"
import { createHealthRouter } from "./routes/health.router.js"
import { createMovieRouter } from "./routes/movies.router.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { limiter } from "./middlewares/trafficLimiter.js"

const CreateApp = ({ movieModel }) => {
    const app = express()
    app.disable("x-powered-by")
        .use(json())
        .use(limiter)
        .use("/movies", createMovieRouter({ movieModel }))
        .use("/", createHealthRouter())
        .use(errorHandler)

    app.listen(PORT, () => {
        console.log(`server listening on port http://localhost:${PORT}`)
    })
}

CreateApp({ movieModel: MoviesModel })