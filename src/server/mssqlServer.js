import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/movies.mssql.repository.js";
import { MssqlDatabase } from "../config/mssqlConnection.js";
import { MssqlErrorMapper } from "../utils/ErrorMappers/mssqlErrorMapper.js";

const database = new MssqlDatabase()
const errorMapper = new MssqlErrorMapper()
const moviesRepository = new MoviesRepository(database, errorMapper)

CreateApp({ moviesRepository: moviesRepository, database: database })