# Movies API

A Node.js REST API for managing movies. Built as a portfolio project to practice layered API design, dual-database support, authentication, Docker, and Azure SQL Database integration.

Based on the original work by Miguel Ángel Durán — [curso-node-js](https://github.com/midudev/curso-node-js).

## Features

* Full CRUD for movies (title, year, director, duration, poster, rate, genre).
* User management with hashed passwords.
* User authentication with **JWT**.
* JWT authentication middleware for protected routes.
* Dual database backends: **PostgreSQL** and **SQL Server** (Azure SQL compatible).
* Repository pattern with swappable data access per database.
* Request validation with **Zod**.
* API key authentication via `api-key` header.
* Rate limiting (20 requests per 15 minutes).
* Centralized error handling with operational vs. unexpected errors.
* Health check endpoint with API version and server time.
* UUID auto-generated for each movie record.
* Docker support for containerized runs.

## Tech Stack

* **Node.js** (ES Modules)
* **Express 5**
* **PostgreSQL** (`pg`) and **SQL Server** (`mssql`)
* **Zod** for schema validation
* **bcrypt** for password hashing
* **jsonwebtoken** for JWT authentication
* **express-rate-limit** for traffic limiting
* **Docker**

## Project Structure

```text
movies-api/
├── db/
│   ├── postgres/          # PostgreSQL schema and stored procedures
│   └── mssql/             # SQL Server schema, views, and stored procedures
├── src/
│   ├── app.js             # Express app factory
│   ├── server/
│   │   ├── pgServer.js    # Entry point — PostgreSQL
│   │   └── mssqlServer.js # Entry point — SQL Server
│   ├── config/            # Environment and database connections
│   ├── controllers/       # HTTP request handlers
│   ├── middlewares/       # Auth, JWT, rate limiting, error handling
│   ├── repositories/      # Database access layer (one per backend)
│   ├── routes/            # Route definitions
│   ├── schemas/           # Zod validation schemas
│   ├── services/          # Business logic and authentication
│   └── utils/             # Shared error classes
├── api.http               # Sample HTTP requests (REST Client / VS Code)
├── Dockerfile
└── .env.example
```

## API Endpoints

The API uses two authentication mechanisms:

* **API key** — identifies and authorizes API clients via the `api-key` header.
* **JWT** — authenticates users on protected user/movie operations.

The health check at `/` does not require authentication.

### Authentication

| Method | Endpoint      | Description                           |
| ------ | ------------- | ------------------------------------- |
| POST   | `/auth/login` | Authenticate a user and receive a JWT |

### Movies

| Method | Endpoint      | Description              |
| ------ | ------------- | ------------------------ |
| GET    | `/movies`     | List all movies          |
| POST   | `/movies`     | Create a movie           |
| PUT    | `/movies/:id` | Replace a movie          |
| PATCH  | `/movies/:id` | Partially update a movie |
| DELETE | `/movies/:id` | Delete a movie           |

### Health

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| GET    | `/`      | Health check |

Protected routes require the appropriate authentication headers.

### Example: Login

```http
POST /auth/login
Content-Type: application/json
api-key: your_api_key

{
  "username": "your_username",
  "password": "your_password"
}
```

A successful login returns a JWT:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Example: Authenticated request

Use the JWT returned by the login endpoint:

```http
GET /movies
Authorization: Bearer your_jwt_token
api-key: your_api_key
```

### Example: Create a movie

```http
POST /movies
Content-Type: application/json
Authorization: Bearer your_jwt_token
api-key: your_api_key

{
  "title": "Inception",
  "year": 2010,
  "director": "Christopher Nolan",
  "duration": 148,
  "rate": 8.8,
  "poster": "https://example.com/poster.jpg",
  "genre": ["Drama", "Action", "Crime"]
}
```

Allowed genres: `Action`, `Adventure`, `Crime`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Thriller`, `Sci-Fi`.

See `api.http` for more examples.

## Setup

### 1. Clone and install

```bash
git clone https://github.com/joancubillo95/movies-api.git
cd movies-api
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable      | Description                          |
| ------------- | ------------------------------------ |
| `DB_USER`     | Database username                    |
| `DB_PASSWORD` | Database password                    |
| `DB_DATABASE` | Database name                        |
| `DB_SERVER`   | SQL Server host (MSSQL backend only) |
| `DB_HOST`     | PostgreSQL host (PG backend only)    |
| `API_KEY`     | Secret key for API authentication    |
| `JWT_SECRET`  | Secret used to sign and verify JWTs  |
| `PORT`        | Server port (default: `3000`)        |
| `NODE_ENV`    | `development` or `production`        |

### 3. Initialize the database

Run the SQL scripts for your chosen backend:

**PostgreSQL**

```bash
# From db/postgres/
# 001_schema.sql → 002_stored_procedures.sql
```

**SQL Server / Azure SQL**

```bash
# From db/mssql/
# 001_schema.sql → 002_views.sql → 003_stored_procedures.sql
```

## Run Locally

Entry points live in `src/server/`. Choose the backend you configured:

**PostgreSQL**

```bash
node src/server/pgServer.js
```

**SQL Server**

```bash
node src/server/mssqlServer.js
```

For development with auto-reload, use nodemon:

```bash
npx nodemon src/server/pgServer.js
npx nodemon src/server/mssqlServer.js
```

The server starts at `http://localhost:<PORT>` (default port `3000`).

## Docker

The image does not bundle secrets. Pass configuration at runtime via environment variables or an env file:

```bash
docker build -t movies-api .
docker run -d -p 8080:8080 --env-file .env --name movies-api movies-api
```

The container defaults to `PORT=8080` and runs the PostgreSQL entry point. Override either as needed:

```bash
docker run -d -p 3000:3000 -e PORT=3000 --env-file .env --name movies-api movies-api
```

Stop and remove:

```bash
docker stop movies-api
docker rm movies-api
```

## License

MIT — see [LICENSE](LICENSE).
