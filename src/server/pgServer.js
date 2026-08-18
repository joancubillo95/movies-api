import { CreateApp } from "../app.js"
import { MoviesRepository } from "../repositories/pg/movies.postgres.repository.js"
import { PgDatabase } from "../config/postgresSqlConnection.js"
import { PostgresErrorMapper } from "../utils/ErrorMappers/postgresErrorMapper.js"
import { UsersRepository } from "../repositories/pg/users.repository.js"

const database = new PgDatabase()
const errorMapper = new PostgresErrorMapper()
const moviesRepository = new MoviesRepository(database, errorMapper)
const usersRepository = new UsersRepository(database, errorMapper)


CreateApp({ moviesRepository: moviesRepository, usersRepository: usersRepository, database: database })