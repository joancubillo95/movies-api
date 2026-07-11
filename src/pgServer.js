import { CreateApp } from "./app.js";
import { MovieService } from "./services/movies.service.js";

CreateApp({ movieModel: MovieService })