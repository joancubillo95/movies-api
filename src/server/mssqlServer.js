import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/movies.mssql.repository.js";
import { MssqlDatabase } from "../config/mssqlConnection.js";

const database = new MssqlDatabase()
const repository = new MoviesRepository(database)

CreateApp({ moviesRepository: repository, database: database })