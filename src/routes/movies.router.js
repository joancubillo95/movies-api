import { MoviesController } from "../controllers/movies.controller.js"
import { Router } from "express"

export const createMovieRouter = ({ moviesRepository }) => {
    const moviesRouter = Router()

    const movieController = new MoviesController({ moviesRepository })

    moviesRouter.get("/", movieController.getAll)
    moviesRouter.post("/", movieController.create)
    moviesRouter.delete("/:id", movieController.delete)
    moviesRouter.patch("/:id", movieController.patch)
    moviesRouter.put("/:id", movieController.put)

    return moviesRouter
}
