import { BaseRepository } from "../base.repository.js"
import sql from "mssql"

const normalizeKeys = (row) => Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
)

const toUser = (user) => {
    if (!user) {
        return undefined
    }
    const row = normalizeKeys(user)
    return {
        id: row.id,
        username: row.username,
        role: row.role
    }
}

const toLoginUser = (user) => {
    if (!user) {
        return undefined
    }
    return {
        ...toUser(user),
        password_hash: normalizeKeys(user).password_hash
    }
}

export class UsersRepository extends BaseRepository {

    login = async ({ username }) => {
        try {
            const pool = await this.database.getPool()
            const [user] = (await pool.request()
                .input("username", sql.VarChar(100), username.toUpperCase())
                .query("SELECT ID, USERNAME, ROLE, PASSWORD_HASH FROM USERS WHERE UPPER(USERNAME) = @username")).recordset
            return toLoginUser(user)
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getByUsername = async ({ username }) => {
        try {
            const pool = await this.database.getPool()
            const [user] = (await pool.request()
                .input("username", sql.VarChar(100), username.toUpperCase())
                .query("SELECT ID, USERNAME, ROLE FROM USERS WHERE UPPER(USERNAME) = @username")).recordset
            return toUser(user)
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getById = async ({ id }) => {
        try {
            const pool = await this.database.getPool()
            const [user] = (await pool.request()
                .input("id", sql.UniqueIdentifier, id)
                .query("SELECT ID, USERNAME, ROLE FROM USERS WHERE ID = @id")).recordset
            return toUser(user)
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

    getAll = async () => {
        try {
            const pool = await this.database.getPool()
            const users = (await pool.request()
                .query("SELECT ID, USERNAME, ROLE FROM USERS")).recordset
            return users.map(toUser)
        } catch (error) {
            throw this.errorMapper.map(error)
        }
    }

}
