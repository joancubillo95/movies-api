import { createTransaction, poolConnect, query } from "../db/connection.js"

export class MoviesModel {
    static getAll = async () => {
        try {
            const movies = await query("SELECT * FROM VW_MOVIES_WITH_GENRES")
            movies.map(movie => ({
                ...movie,
                GENRES: movie.GENRES.split(",")
            }));
            return movies
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
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
        const transac = await createTransaction()
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
            console.log(error)
            throw new Error(error)
        }
    }

    static delete = async ({ id }) => {
        try {
            const result = await poolConnect
                .request()
                .input("Id", id)
                .query("DELETE FROM MOVIE WHERE ID = @Id")
            const [rowsAffected] = result.rowsAffected
            return rowsAffected
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}