# Movies API

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI](https://github.com/joancubillo95/movies-api/actions/workflows/ci.yml/badge.svg)](https://github.com/joancubillo95/movies-api/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/joancubillo95/movies-api?display_name=tag&sort=semver)](https://github.com/joancubillo95/movies-api/releases)
[![Docker Image](https://img.shields.io/badge/docker-ready-blue)](#)

A Node.js REST API to manage movies — built as a portfolio project to practice layered API design, dual database support (PostgreSQL & SQL Server), authentication (API key + JWT), Docker, and Azure SQL integration.

The **PostgreSQL** setup is the default and the most complete path. A SQL Server repository exists, but the SQL Server entry point is not fully wired yet — see [Known Limitations](#known-limitations).

Based on Miguel Ángel Durán — [curso-node-js](https://github.com/midudev/curso-node-js).

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Database Initialization](#database-initialization)
- [Running](#running)
- [Docker](#docker)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Testing, CI & Releases](#testing-ci--releases)
- [Security Notes](#security-notes)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

## Features
- Full CRUD for movies (title, year, director, duration, poster, rate, genre).
- User lookup by ID or username (password hashes are never returned by public reads).
- API key + JWT authentication with access and refresh tokens.
- Role-based access (`admin` required for movie mutations and listing all users).
- PostgreSQL and SQL Server movie repositories behind a shared repository pattern.
- OpenAPI/Swagger documentation at `/api/v1/api-docs`.
- Validation with Zod, centralized error handling, rate limiting, and a health endpoint.
- Vitest unit tests with coverage reporting in CI.
- Automated releases from `main` with semantic-release.

## Tech Stack
- Node.js 24 (ES Modules), Express 5
- PostgreSQL (`pg`) and SQL Server (`mssql`)
- Zod, bcrypt, jsonwebtoken, express-rate-limit, swagger-ui-express
- Docker, Vitest 5
- GitHub Actions, semantic-release

## Quick Start
1. Clone and install:

```bash
git clone https://github.com/joancubillo95/movies-api.git
cd movies-api
npm install
```

2. Copy and edit env:

```bash
cp .env.example .env
```

`.env.example` contains every required key with placeholder values. Replace the placeholders with your database credentials, API key, and JWT secret. See [Configuration](#configuration) for details.

3. Initialize the database (see [Database Initialization](#database-initialization)).

4. Run:

```bash
# PostgreSQL (default and recommended)
npm run dev:pg

# SQL Server (not fully wired yet — see Known Limitations)
npm run dev:mssql
```

## Configuration
Environment variables (also listed in `.env.example`):

| Variable | Required | Used by | Description |
|----------|----------|---------|-------------|
| `DB_DRIVER` | Yes | Env validation | `postgres` or `mssql`. The running entry point is still selected by the npm script. |
| `DB_USER` | Yes | Both databases | Database username |
| `DB_PASSWORD` | Yes | Both databases | Database password |
| `DB_DATABASE` | Yes | Both databases | Database name |
| `DB_HOST` | PostgreSQL | PostgreSQL | PostgreSQL host |
| `DB_PORT` | PostgreSQL | PostgreSQL | PostgreSQL port |
| `DB_SERVER` | SQL Server | SQL Server / Azure SQL | SQL Server host |
| `API_KEY` | Yes | All requests except Swagger UI | API key sent in the `api-key` header |
| `JWT_SECRET` | Yes | Auth | Non-empty secret used to sign access and refresh tokens |
| `PORT` | Yes | Server | Server port; the Docker image sets it to `8080` |
| `NODE_ENV` | No | Error handling | `development` (default) or `production` |

## Database Initialization
Run the SQL scripts in order for your chosen backend.

**PostgreSQL** — files in `db/postgres/`:
1. `001_schema.sql`
2. `002_views.sql`
3. `003_stored_procedures.sql`
4. `004_users.sql`

**SQL Server** — files in `db/mssql/`:
1. `001_schema.sql`
2. `002_views.sql`
3. `003_stored_procedures.sql`

PostgreSQL is the only backend with the users table and the users/auth repositories wired up. The SQL Server scripts only cover movies.

Both schemas seed the same genres: `Drama`, `Action`, `Crime`, `Adventure`, `Sci-Fi`, and `Romance`.

## Running
| Command | Description |
|---------|-------------|
| `npm run dev:pg` | Start with nodemon (PostgreSQL) |
| `npm run dev:mssql` | SQL Server entry point — currently not fully wired, see [Known Limitations](#known-limitations) |
| `npm start` | Start in production mode (PostgreSQL) |
| `npm test` | Run Vitest in watch mode |
| `npx vitest run --coverage` | Run the test suite once and print coverage |

## Docker
Build:

```bash
docker build -t movies-api .
```

Run (env file required):

```bash
docker run -d -p 8080:8080 --env-file .env --name movies-api movies-api
```

The image runs the PostgreSQL entry point and sets `PORT=8080`. Your env file must include `API_KEY`, `DB_DRIVER`, `JWT_SECRET`, and the PostgreSQL connection variables.

## API Reference
**Base URL:** `http://localhost:<PORT>/api/v1`

**Interactive docs:** `http://localhost:<PORT>/api/v1/api-docs`

All endpoints require the `api-key` header unless noted. Protected routes also require a valid JWT (`Authorization: Bearer <token>`).

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | API key | Returns API version and server time |

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | API key | Authenticate and receive an access token |
| POST | `/auth/refresh` | API key + refresh cookie | Issue a new access token |

**Login request body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Login response:**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user",
    "role": "user"
  }
}
```

The login response also sets a `refreshToken` cookie:

- `httpOnly`
- `sameSite: strict`
- `secure: true` — the cookie is only sent over HTTPS
- path `/api/v1/auth`
- `maxAge` of 7 days

Access tokens expire after 10 minutes. Refresh tokens themselves expire after 1 day.

### Movies
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/movie` | JWT | any | List all movies |
| GET | `/movie/:id` | JWT | any | Get a movie by ID |
| POST | `/movie` | JWT | admin | Create a movie |
| PUT | `/movie/:id` | JWT | admin | Replace a movie |
| PATCH | `/movie/:id` | JWT | admin | Partially update a movie |
| DELETE | `/movie/:id` | JWT | admin | Delete a movie |

**Movie body (create / full update):**
```json
{
  "title": "The Matrix",
  "year": 1999,
  "director": "Lana Wachowski",
  "duration": 136,
  "rate": 8.7,
  "poster": "https://example.com/poster.jpg",
  "genre": ["Action", "Sci-Fi"]
}
```

Genres accepted by Zod: `Action`, `Adventure`, `Comedy`, `Crime`, `Drama`, `Fantasy`, `Horror`, `Romance`, `Sci-Fi`, `Thriller`.

Genres currently seeded in the database: `Action`, `Adventure`, `Crime`, `Drama`, `Romance`, `Sci-Fi`. Accepted genres without a matching `GENRE` row are not linked to the movie — see [Known Limitations](#known-limitations).

### Users
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/user` | JWT | admin | List all users |
| GET | `/user/:id` | JWT | any | Get a user by ID |
| GET | `/user/username/:username` | JWT | any | Get a user by username |

User responses expose `id`, `username`, and `role` only — never `password_hash`.

### Examples

**Login:**
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{"username":"user","password":"pass"}'
```

**List movies:**
```bash
curl -X GET "http://localhost:3000/api/v1/movie" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "api-key: YOUR_API_KEY"
```

**Get movie by ID:**
```bash
curl -X GET "http://localhost:3000/api/v1/movie/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "api-key: YOUR_API_KEY"
```

**Create movie (admin):**
```bash
curl -X POST "http://localhost:3000/api/v1/movie" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "title": "The Matrix",
    "year": 1999,
    "director": "Lana Wachowski",
    "duration": 136,
    "rate": 8.7,
    "poster": "https://example.com/poster.jpg",
    "genre": ["Action", "Sci-Fi"]
  }'
```

**Partially update a movie (admin):**
```bash
curl -X PATCH "http://localhost:3000/api/v1/movie/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "title": "The Matrix Reloaded",
    "year": 2003
  }'
```

**Get a user by username:**
```bash
curl -X GET "http://localhost:3000/api/v1/user/username/your_username" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "api-key: YOUR_API_KEY"
```

## Authentication
Every request must include an `api-key` header matching the `API_KEY` env variable. Swagger UI (`/api/v1/api-docs`) is the only exception.

Protected routes (`/movie`, `/user`) additionally require a Bearer JWT obtained from `/auth/login`. Access tokens carry the user's `id`, `username`, and `role`.

| Role | Permissions |
|------|-------------|
| `user` | Read movies and look up users |
| `admin` | All `user` permissions plus create, update, delete movies and list all users |

Rate limiting is configured globally for 20 requests per 15-minute window per IP.

## Testing, CI & Releases
```bash
npm test                      # Vitest watch mode
npx vitest run --coverage     # One-off test run with coverage
npm run dev:pg                # Development server (PostgreSQL)
npm run dev:mssql             # SQL Server entry point (not fully wired)
npm start                     # Production start (PostgreSQL)
```

The test suite currently contains 20 tests:

- `tests/unit/db/pg/movies.postgres.repository.test.js` — PostgreSQL movie repository
- `tests/unit/db/mssql/mssqlErrorMapper.test.js` — SQL Server error mapper

**CI** (`.github/workflows/ci.yml`): runs on pushes to `main`, `develop`, and `feature/*`, and on pull requests to `develop`. It installs with `npm ci`, runs the tests with coverage, and uploads the coverage report.

**Releases** (`.github/workflows/release.yml`): semantic-release runs on pushes to `main`, updates `CHANGELOG.md`, bumps the package version, and publishes the GitHub release.

## Security Notes
- Never commit `.env` with secrets. Use GitHub Actions secrets or Azure Key Vault in CI/CD.
- Rotate `API_KEY` and `JWT_SECRET` in production.
- `JWT_SECRET` is validated as a non-empty string at startup.
- The refresh cookie is marked `secure`, so it requires HTTPS.
- Consider a migration tool (Flyway, Knex, etc.) instead of raw SQL scripts for production deployments.

## Known Limitations
This is a portfolio project, not a production-ready deployment. Current gaps:

- **SQL Server entry point:** `src/server/mssqlServer.js` still imports `../repositories/movies.mssql.repository.js`, while the repository now lives under `src/repositories/mssql/`. `npm run dev:mssql` will not start until that import is corrected.
- **Users/auth on SQL Server:** only PostgreSQL has a `UsersRepository`; the SQL Server entry point does not receive one.
- **User 404 responses:** the users controller sends a 404 but does not `return` afterwards, so it attempts to send a second response.
- **Refresh endpoint:** missing or invalid refresh tokens are currently wrapped as a 500 error, not a 401.
- **Refresh cookie:** the cookie `maxAge` is 7 days while the refresh JWT expires in 1 day. The cookie is also always `secure`, including in development.
- **Genre seed mismatch:** `Comedy`, `Fantasy`, `Horror`, and `Thriller` are accepted by Zod but are not seeded in the `GENRE` table, so they will not be linked to movies.
- **Rate limiter:** `src/app.js` registers the limiter twice, so the effective limit may be lower than the configured 20 requests per 15 minutes.

## Contributing
Open an issue or pull request on [GitHub](https://github.com/joancubillo95/movies-api). For larger changes, describe the approach in an issue first.

## License
MIT — see [LICENSE](LICENSE).

## Acknowledgements
- Based on Miguel Ángel Durán — [curso-node-js](https://github.com/midudev/curso-node-js)

