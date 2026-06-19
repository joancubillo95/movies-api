export class MoviesController {
    constructor({ movieModel }) {
        this.movieModel = movieModel
    }

    getAll = async (req, res) => {
        const movies = await this.movieModel.getAll()
        res.json(movies)
    }
}