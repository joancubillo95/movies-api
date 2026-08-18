import { AppError } from "../../utils/appError.js"
import { BaseRepository } from "../base.repository.js"
import { PgDatabase } from "../../config/postgresSqlConnection.js"
import { PostgresErrorMapper } from "../../utils/ErrorMappers/postgresErrorMapper.js"

export class MoviesRepository extends BaseRepository {
    getAll = async () => {
        try {
            const pool = await this.database.getPool()
            let movies = (await pool.query("SELECT * FROM VW_MOVIES_WITH_GENRES")).rows
            movies = movies.map(movie => ({
                ...movie,
                genre: movie.genre.split(",")
            }))
            return movies
        } catch (error) {
            throw this.errorMapper.map(error)
        }

    }

    create = async ({ input }) => {
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
        const pool = await this.database.getPool()
        const client = await pool.connect()

        try {
            await client.query("BEGIN")
            const [{ id: newId }] = (await client.query("SELECT GEN_RANDOM_UUID() ID")).rows

            query = "INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER)"
                + " VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *"
            values = [newId, title, year, director, duration, rate, poster]

            const res = await client.query(query, values)

            for (const genre of genreInput) {
                const lowerGenre = genre.toLowerCase()
                query = "INSERT INTO MOVIE_GENRES (MOVIE_ID, GENRE_ID) VALUES ($1, (SELECT ID FROM GENRE WHERE LOWER(NAME) = $2))"
                values = [newId, lowerGenre]
                await client.query(query, values)
            }

            await client.query("COMMIT")

            let [newMovie] = res.rows
            newMovie = { ...newMovie, genre: genreInput }

            return newMovie
        } catch (error) {
            await client.query("ROLLBACK")
            throw this.errorMapper.map(error)

        } finally {
            await client.release()
        }
    }

    update = async ({ id, input }) => {
        const {
            title,
            year,
            director,
            duration,
            rate,
            poster,
            genre: genreInput
        } = input
        let rowsAffected = 0;
        const pool = await this.database.getPool()
        const transaction = await pool.connect()

        try {
            await transaction.query("BEGIN")
            const values = [id]
            let updateColumns = []
            if (title) {
                values.push(title)
                updateColumns.push(`TITLE = $${values.length}`)
            }
            if (year) {
                values.push(year)
                updateColumns.push(`YEAR = $${values.length}`)
            }
            if (director) {
                values.push(director)
                updateColumns.push(`DIRECTOR = $${values.length}`)
            }
            if (duration) {
                values.push(duration)
                updateColumns.push(`DURATION = $${values.length}`)
            }
            if (rate) {
                values.push(rate)
                updateColumns.push(`RATE = $${values.length}`)
            }
            if (poster) {
                values.push(poster)
                updateColumns.push(`POSTER = $${values.length}`)
            }

            if (values.length === 1 && (!genreInput || genreInput.length === 0)) {
                throw new Error("Nothing to update")
            } else if (values.length > 1) {

                const result = await transaction.query("UPDATE MOVIE SET " + updateColumns.join(",") + " WHERE ID = $1", values)
                rowsAffected += result.rowCount
            }

            if (genreInput && genreInput.length > 0) {
                const result = await transaction.query("CALL SP_UPDATE_MOVIE_GENRES($1, $2)", [id, genreInput.join(",")])
                rowsAffected += result.rowCount
            }
            return rowsAffected
            await transaction.query("COMMIT")
        } catch (error) {
            await transaction.query("ROLLBACK")
            throw this.errorMapper.map(error)
        } finally {
            await transaction.release()
        }
    }

    delete = async ({ id }) => {
        try {
            const query = "DELETE FROM MOVIE WHERE ID = $1"
            const values = [id]
            const result = await (await this.database.getPool()).query(query, values)
            return result.rowCount
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }
}