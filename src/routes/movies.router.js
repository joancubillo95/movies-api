import { MoviesController } from "../controllers/movies.controller.js"
import { Router } from "express"
import { auth } from "../middlewares/auth.js"

export const createMovieRouter = ({ moviesRepository }) => {
    const moviesRouter = Router()

    const movieController = new MoviesController({ moviesRepository })

    /**
     * @swagger
     * /movies:
     *   get:
     *     summary: Get all movies
     *     tags:
     *       - Movies
     *     responses:
     *       200:
     *         description: Successfully retrieved movies
     */
    moviesRouter.get("/", movieController.getAll)
    moviesRouter.post("/", movieController.create)
    moviesRouter.delete("/:id", movieController.delete)
    moviesRouter.patch("/:id", movieController.patch)
    moviesRouter.put("/:id", movieController.put)

    return moviesRouter
}
