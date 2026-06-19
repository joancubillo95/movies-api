import express, { json } from "express"
import { createMovieRouter } from "./routes/movies.router.js"
import { MoviesModel } from "./models/movies.model.js"
import 'dotenv/config'
import { createHealthRouter } from "./routes/health.router.js"
import { limiter } from "./middlewares/loginLimiter.js"

const CreateApp = ({ movieModel }) => {
    const app = express()
    app.use(json())
    app.disable("x-powered-by")
    app.use(limiter);

    app.use("/movies", createMovieRouter({ movieModel }))
    app.use("/", createHealthRouter())

    const PORT = process.env.PORT ?? 8080

    app.listen(PORT, () => {
        console.log(`server listening on port http://localhost:${PORT}`)
    })
}

CreateApp({ movieModel: MoviesModel })