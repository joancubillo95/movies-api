import { Router } from "express"
import { MoviesController } from "../controllers/movies.controller.js"

export const createMovieRouter = ({ movieModel }) => {
    const moviesRouter = Router()

    const movieController = new MoviesController({ movieModel })

    moviesRouter.get("/", movieController.getAll)
    moviesRouter.post("/", movieController.create)
    moviesRouter.delete("/:id", movieController.delete)
    moviesRouter.patch("/:id", movieController.patch)

    return moviesRouter
}
