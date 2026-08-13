import { PgDatabase, pool } from "../config/postgresSqlConnection.js"

import { AppError } from "../utils/appError.js"
import { DbError } from "../utils/dbError.js"
import { PostgresErrorMapper } from "../utils/ErrorMappers/postgresErrorMapper.js"

export class MoviesRepository {
    constructor(database, errorMapper) {
        /**@type {PgDatabase} */
        this.database = database
        /**@type {PostgresErrorMapper} */
        this.errorMapper = errorMapper
    }
    getAll = async () => {
        try {
            return await this.database.getPool().query("SELECT dfghs FROM GENRE")
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
}