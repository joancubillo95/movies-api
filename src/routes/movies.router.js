import { MoviesController } from "../controllers/movies.controller.js"
import { Router } from "express"
import { authenticateJWT } from "../middlewares/auth.js"
import { requireRole } from "../middlewares/roleMiddleware.js"

export const createMovieRouter = ({ moviesRepository }) => {
    const moviesRouter = Router()

    const movieController = new MoviesController({ moviesRepository })

    moviesRouter.get("/", movieController.getAll)
    moviesRouter.post("/", requireRole("admin"), movieController.create)
    moviesRouter.delete("/:id", requireRole("admin"), movieController.delete)
    moviesRouter.patch("/:id", requireRole("admin"), movieController.patch)
    moviesRouter.put("/:id", requireRole("admin"), movieController.put)

    return moviesRouter
}
