import { BaseRepository } from "../base.repository.js"
import sql from "mssql"

const normalizeKeys = (row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
)

const toMovie = (movie) => {
    if (!movie) {
        return null
    }
    const row = normalizeKeys(movie)
    return {
        ...row,
        genre: row.genre.split(",")
    }
}

export class MoviesRepository extends BaseRepository {
    getAll = async () => {
        try {
            const pool = await this.database.getPool()
            let movies = (await pool.request().query("SELECT * FROM VW_MOVIES_WITH_GENRES")).recordset
            if (!movies) {
                return null
            }
            movies = movies.map(toMovie)
            return movies
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getById = async (id) => {
        try {
            const pool = await this.database.getPool()
            const movie = (await pool.request()
                .input("id", sql.UniqueIdentifier, id)
                .query("SELECT * FROM VW_MOVIES_WITH_GENRES WHERE ID = @id")).recordset[0]
            if (!movie) {
                return null
            }
            return toMovie(movie)
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
        const transaction = await this.database.createTransaction()
        await transaction.begin()
        try {
            const newIdResult = await transaction.request().query("SELECT NEWID() ID")
            const [{ ID: newId }] = newIdResult.recordset

            await transaction.request()
                .input("id", sql.UniqueIdentifier, newId)
                .input("title", sql.VarChar(255), title)
                .input("year", sql.Int, year)
                .input("director", sql.VarChar(255), director)
                .input("duration", sql.Int, duration)
                .input("rate", sql.Decimal(3, 1), rate)
                .input("poster", sql.VarChar(255), poster)
                .query("INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER)"
                    + " VALUES(@id, @title, @year, @director, @duration, @rate, @poster)")

            for (const genre of genreInput) {
                const lowerGenre = genre.toLowerCase()
                await transaction.request()
                    .input("movieId", sql.UniqueIdentifier, newId)
                    .input("genre", sql.VarChar(255), lowerGenre)
                    .query("INSERT INTO MOVIE_GENRES (MOVIE_ID, GENRE_ID) VALUES (@movieId, (SELECT ID FROM GENRE WHERE LOWER(NAME) = @genre))")
            }

            const newMovie = (await transaction.request()
                .input("id", sql.UniqueIdentifier, newId)
                .query("SELECT * FROM MOVIE WHERE ID = @id")).recordset[0]

            const createdMovie = { ...normalizeKeys(newMovie), genre: genreInput }
            await transaction.commit()
            return createdMovie
        } catch (error) {
            await transaction.rollback()
            throw this.errorMapper.map(error)
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
        let rowsAffected = 0
        const transaction = await this.database.createTransaction()
        await transaction.begin()
        try {
            const updates = []
            const request = transaction.request().input("id", sql.UniqueIdentifier, id)
            if (title) {
                request.input("title", sql.VarChar(255), title)
                updates.push("TITLE = @title")
            }
            if (year) {
                request.input("year", sql.Int, year)
                updates.push("YEAR = @year")
            }
            if (director) {
                request.input("director", sql.VarChar(255), director)
                updates.push("DIRECTOR = @director")
            }
            if (duration) {
                request.input("duration", sql.Int, duration)
                updates.push("DURATION = @duration")
            }
            if (rate) {
                request.input("rate", sql.Decimal(3, 1), rate)
                updates.push("RATE = @rate")
            }
            if (poster) {
                request.input("poster", sql.VarChar(255), poster)
                updates.push("POSTER = @poster")
            }

            const hasGenres = genreInput && genreInput.length > 0

            if (updates.length === 0 && !hasGenres) {
                throw new Error("Nothing to update")
            } else if (updates.length > 0) {
                const result = await request.query(
                    "UPDATE MOVIE"
                    + ` SET ${updates.join(",")} `
                    + " WHERE ID = @id"
                )
                rowsAffected += result.rowsAffected[0] ?? 0
            }

            if (hasGenres) {
                const result = await transaction.request()
                    .input("movieId", sql.UniqueIdentifier, id)
                    .input("genres", sql.VarChar(sql.MAX), genreInput.join(","))
                    .execute("UPDATE_MOVIE_GENRES")
                rowsAffected += (result.rowsAffected || []).reduce(
                    (total, count) => total + (count ?? 0),
                    0
                )
            }

            await transaction.commit()
            return rowsAffected
        } catch (error) {
            await transaction.rollback()
            throw this.errorMapper.map(error)
        }
    }

    delete = async ({ id }) => {
        try {
            const pool = await this.database.getPool()
            const result = await pool.request()
                .input("id", sql.UniqueIdentifier, id)
                .query("DELETE FROM MOVIE WHERE ID = @id")
            return (result.rowsAffected[0] ?? 0) > 0
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }
}
