import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/movies.mssql.repository.js";

CreateApp({ moviesRepository: MoviesRepository })