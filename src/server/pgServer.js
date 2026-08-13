import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/movies.postgres.repository.js";
import { PgDatabase } from "../config/postgresSqlConnection.js";
import { PostgresErrorMapper } from "../utils/ErrorMappers/postgresErrorMapper.js";

const database = new PgDatabase()
const errorMapper = new PostgresErrorMapper()
const repository = new MoviesRepository(database, errorMapper)

CreateApp({ moviesRepository: repository, database: database })