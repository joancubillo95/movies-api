import { AppError } from "../utils/appError.js"
import { DbError } from "../utils/dbError.js"
import { pool } from "../config/postgresSqlConnection.js"

export class MoviesRepository {
    static getAll = async () => {
        return await pool.query("SELECT dfghs FROM GENRE")
    }

    static create = async ({ input }) => {
        const {
            title,
            year,
            director,
            duration,
            rate,
            poster,
            genre: genreInput
        } = input

        let query = ""
        let values = []

        try {
            await pool.query("BEGIN")
            const [{ id: newId }] = (await pool.query("SELECT GEN_RANDOM_UUID() ID")).rows

            query = "INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER)"
                + " VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *"
            values = [newId, title, year, director, duration, rate, poster]

            const res = await pool.query(query, values)

            for (const genre of genreInput) {
                const lowerGenre = genre.toLowerCase()
                query = "INSERT INTO MOVIE_GENRES (MOVIE_ID, GENRE_ID) VALUES ($1, (SELECT ID FROM GENRE WHERE LOWER(NAME) = $2))"
                values = [newId, lowerGenre]
                await pool.query(query, values)
            }

            await pool.query("COMMIT")

            let [newMovie] = res.rows
            newMovie = { ...newMovie, genre: genreInput }

            return newMovie
        } catch (error) {
            await pool.query("ROLLBACK")
            if (error.severity === "ERROR") {
                throw new DbError(error, "postgres")
            } else {
                throw new AppError("Unexpected error", 500, error)
            }

        } finally {
            await pool.release()
        }
    }
}