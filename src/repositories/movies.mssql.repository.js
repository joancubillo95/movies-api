import { AppError } from "../utils/appError.js";
import { MssqlErrorMapper } from "../utils/ErrorMappers/mssqlErrorMapper.js";
import sql from "mssql"

export class MoviesRepository {
    constructor(database, errorMapper) {
        this.database = database
        this.errorMapper = errorMapper
    }
    getAll = async () => {
        try {
            const pool = await this.database.getPool()
            let movies = (await pool.request().query("SELECT * FROM VW_MOVIES_WITH_GENRES")).recordset
            movies = movies.map(movie => ({
                ...movie,
                GENRE: movie.GENRE.split(",")
            }));
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
        const transac = await this.database.createTransaction()
        await transac.begin()
        try {
            const newIdResult = await transac.request().query("SELECT NEWID() ID")
            const [{ ID: newId }] = newIdResult.recordset

            await transac.request()
                .input("Id", newId)
                .input("Title", title)
                .input("Year", year)
                .input("Director", director)
                .input("Duration", duration)
                .input("Rate", rate)
                .input("Poster", poster)
                .query("INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER)"
                    + " VALUES(@Id, @title, @year, @director, @duration, @rate, @poster)")

            for (const genre of genreInput) {
                const lowerGenre = genre.toLowerCase()
                await transac
                    .request()
                    .input("MovieId", newId)
                    .input("Genre", lowerGenre)
                    .query("INSERT INTO MOVIE_GENRES (MOVIE_ID, GENRE_ID) VALUES (@MovieId, (SELECT ID FROM GENRE WHERE LOWER(NAME) = @Genre))")
            }

            let newMovie = await transac.request()
                .input("Id", newId)
                .query("SELECT * FROM MOVIE WHERE ID = @Id")

            await transac.commit()
            newMovie = { ...newMovie.recordset[0], GENRE: genreInput }
            return newMovie
        } catch (error) {
            await transac.rollback()
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
        const transaction = await this.database.createTransaction()
        await transaction.begin()
        try {
            const updates = []
            const request = transaction.request().input("ID", id)
            if (title) {
                request.input("TITLE", title)
                updates.push("TITLE = @TITLE")
            }
            if (year) {
                request.input("YEAR", year)
                updates.push("YEAR = @YEAR")
            }
            if (director) {
                request.input("DIRECTOR", director)
                updates.push("DIRECTOR = @DIRECTOR")
            }
            if (duration) {
                request.input("DURATION", duration)
                updates.push("DURATION = @DURATION")
            }
            if (rate) {
                request.input("RATE", rate)
                updates.push("RATE = @RATE")
            }
            if (poster) {
                request.input("POSTER", poster)
                updates.push("POSTER = @POSTER")
            }

            if (updates.length == 0 && !genreInput) {
                throw new Error("Nothing to update")
            } else if (updates.length >= 1) {
                const { rowsAffected } = await request
                    .query("UPDATE MOVIE"
                        + ` SET ${(updates.join(","))} `
                        + " WHERE ID = @ID"
                    )
                const [movieRows] = rowsAffected
            }

            //Check if any movie was updated
            if (genreInput) {
                const result = await transaction
                    .request()
                    .input("MOVIE_ID", sql.UniqueIdentifier, id)
                    .input("GENRES", sql.VarChar(sql.MAX), genreInput.join(","))
                    .execute("UPDATE_MOVIE_GENRES")
            }
            await transaction.commit()
        } catch (error) {
            await transaction.rollback()
            throw this.errorMapper.map(error)
        }
    }

    delete = async ({ id }) => {
        try {
            const result = await this.database.getPool()
                .request()
                .input("Id", id)
                .query("DELETE FROM MOVIE WHERE ID = @Id")
            const [rowsAffected] = result.rowsAffected
            return rowsAffected
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }
}