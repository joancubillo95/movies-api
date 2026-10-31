import { MssqlDatabase } from "../config/mssqlConnection.js"
import { MssqlErrorMapper } from "../utils/ErrorMappers/mssqlErrorMapper.js"

export class BaseMssqlRepository {
    constructor(database, errorMapper) {
        /**@type {MssqlDatabase} */
        this.database = database
        /**@type {MssqlErrorMapper} */
        this.errorMapper = errorMapper
    }
}