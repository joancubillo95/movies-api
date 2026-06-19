import { validateMovie } from "../schemas/movies.schema.js"

export class MoviesController {
    constructor({ movieModel }) {
        this.movieModel = movieModel
    }

    getAll = async (req, res) => {
        const movies = await this.movieModel.getAll()
        res.json(movies)
    }

    create = async (req, res) => {
        console.log("Calling to create movie")
        const result = validateMovie(req.body)

        console.log(JSON.stringify(result.data))
        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }

        const newMovie = await this.movieModel.create({ input: result.data })

        return res.status(201).json(newMovie)
    }
}