import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/mssql/movies.mssql.repository.js";
import { MssqlDatabase } from "../config/mssqlConnection.js";
import { MssqlErrorMapper } from "../utils/ErrorMappers/mssqlErrorMapper.js";
import { UsersRepository } from "../repositories/mssql/users.repository.js";

const database = new MssqlDatabase()
const errorMapper = new MssqlErrorMapper()
const moviesRepository = new MoviesRepository(database, errorMapper)
const usersRepository = new UsersRepository(database, errorMapper)

CreateApp({ moviesRepository: moviesRepository, usersRepository: usersRepository, database: database })
