import { validateMovie, validatePartialMovie } from "../schemas/movies.schema.js"

export class MoviesController {
    constructor({ moviesRepository }) {
        this.moviesRepository = moviesRepository
    }

    getAll = async (req, res) => {
        const movies = await this.moviesRepository.getAll()
        res.json(movies)
    }

    create = async (req, res) => {
        const result = validateMovie(req.body)

        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }

        const newMovie = await this.moviesRepository.create({ input: result.data })

        return res.status(201).json(newMovie)
    }

    patch = async (req, res) => {
        const { id } = req.params
        const result = validatePartialMovie(req.body)

        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }

        await this.moviesRepository.update({ id, input: result.data })
        return res.json({ message: "Movie updated!" })
    }

    put = async (req, res) => {
        const { id } = req.params
        const result = validateMovie(req.body)

        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }

        await this.moviesRepository.update({ id, input: result.data })
        return res.json({ message: "Movie updated!" })
    }

    delete = async (req, res) => {
        const { id } = req.params
        const rowsAffected = await this.moviesRepository.delete({ id })
        if (rowsAffected == 0) {
            return res.status(404).json({ "message": "Movie not found!" })
        }
        return res.json({ "message": "Movie deleted!" })
    }
}