import { CreateApp } from "../app.js";
import { MoviesRepository } from "../repositories/movies.postgres.repository.js";

CreateApp({ moviesRepository: MoviesRepository })