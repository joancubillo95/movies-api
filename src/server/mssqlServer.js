import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/movies.mssql.repository.js";
import { MssqlDatabase } from "../config/mssqlConnection.js";
import { MssqlErrorMapper } from "../utils/ErrorMappers/mssqlErrorMapper.js";

const database = new MssqlDatabase()
const errorMapper = new MssqlErrorMapper()
const repository = new MoviesRepository(database, errorMapper)

CreateApp({ moviesRepository: repository, database: database })