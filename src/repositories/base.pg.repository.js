import { PgDatabase } from "../config/postgresSqlConnection.js"
import { PostgresErrorMapper } from "../utils/ErrorMappers/postgresErrorMapper.js"

export class BasePgRepository {
    constructor(database, errorMapper) {
        /**@type {PgDatabase} */
        this.database = database
        /**@type {PostgresErrorMapper} */
        this.errorMapper = errorMapper
    }
}