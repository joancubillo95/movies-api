import { Router } from 'express'
import { MoviesController } from '../controllers/movies.controller.js'

export const createMovieRouter = ({ movieModel }) => {
    const moviesRouter = Router()

    const movieController = new MoviesController({ movieModel })

    moviesRouter.get('/', movieController.sayHello)

    return moviesRouter
}
