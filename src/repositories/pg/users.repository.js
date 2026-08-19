import { BaseRepository } from "../base.repository.js";
import { PgDatabase } from "../../config/postgresSqlConnection.js";
import { PostgresErrorMapper } from "../../utils/ErrorMappers/postgresErrorMapper.js"

export class UsersRepository extends BaseRepository {

    getByUsername = async ({ username }) => {
        try {
            const pool = await this.database.getPool()
            const [user] = (await pool.query("SELECT * FROM USERS WHERE UPPER(USERNAME) = $1", [username.toUpperCase()])).rows
            if (!user) {
                throw new Error("User not found!")
            }
            return user
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getAll = async () => {
        try {

            const pool = await this.database.getPool()
            const users = (await pool.query("SELECT * FROM USERS")).rows
            return users
        } catch (error) {
            console.log(error)
            throw this.errorMapper.map(error)
        }


    }

}