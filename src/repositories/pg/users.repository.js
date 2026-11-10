import { AppError } from "../../utils/appError.js";
import { BaseRepository } from "../base.repository.js";
import { PgDatabase } from "../../config/postgresSqlConnection.js";
import { PostgresErrorMapper } from "../../utils/ErrorMappers/postgresErrorMapper.js"

export class UsersRepository extends BaseRepository {

    login = async ({ username }) => {
        try {
            const pool = await this.database.getPool()
            const [user] = (await pool.query("SELECT id, username, role, password_hash FROM USERS WHERE UPPER(USERNAME) = $1", [username.toUpperCase()])).rows
            return user
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getByUsername = async ({ username }) => {
        try {
            const pool = await this.database.getPool()
            const [user] = (await pool.query("SELECT id, username, role FROM USERS WHERE UPPER(USERNAME) = $1", [username.toUpperCase()])).rows
            return user
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getById = async ({ id }) => {
        try {
            const pool = await this.database.getPool()
            const response = await pool.query("SELECT id, username, role FROM USERS WHERE id = $1", [id])
            const [user] = response.rows
            return user
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getAll = async () => {
        try {
            const pool = await this.database.getPool()
            const users = (await pool.query("SELECT id, username, role FROM USERS")).rows
            return users
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

}