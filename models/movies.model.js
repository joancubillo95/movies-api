import { query } from "../db/connection.js"

export class MoviesModel {
    static getAll = async () => {
        try {
            return await query("SELECT * FROM MOVIE")
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}