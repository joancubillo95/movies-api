import { pool } from "../config/postgresSqlConnection.js"

export class MovieService {
    static getAll = async () => {
        return await pool.query("SELECT * FROM GENRE")
    }
}