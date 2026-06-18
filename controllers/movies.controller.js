export class MoviesController {
    constructor({ movieModel }) {
        this.movieModel = movieModel
    }

    sayHello = async (req, res) => {
        res.json({ message: "Hello World!" })
    }
}