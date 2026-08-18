import { BaseRepository } from "../base.repository.js";
import { PgDatabase } from "../../config/postgresSqlConnection.js";
import { PostgresErrorMapper } from "../../utils/ErrorMappers/postgresErrorMapper.js"

export class UsersRepository extends BaseRepository {

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