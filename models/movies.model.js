import { poolConnect, query } from "../db/connection.js"

export class MoviesModel {
    static getAll = async () => {
        try {
            return await query("SELECT * FROM MOVIE")
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
            genreInput: genre
        } = input
        try {
            const newIdResult = await poolConnect.request().query("SELECT NEWID() ID")
            const [{ ID: newId }] = newIdResult.recordset
            await poolConnect.request()
                .input("Id", newId)
                .input("Title", title)
                .input("Year", year)
                .input("Director", director)
                .input("Duration", duration)
                .input("Rate", rate)
                .input("Poster", poster)
                .query("INSERT INTO MOVIE (ID, TITLE, YEAR, DIRECTOR, DURATION, RATE, POSTER)"
                    + " VALUES(@Id, @title, @year, @director, @duration, @rate, @poster)")

            const newMovie = await poolConnect.request()
                .input("Id", newId)
                .query("SELECT * FROM MOVIE WHERE ID = @Id")

            return newMovie.recordset
        } catch (error) {
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