# Movies API

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js CI](https://img.shields.io/badge/ci-github_actions-blue)](#)
[![Docker Image](https://img.shields.io/badge/docker-ready-blue)](#)

A Node.js REST API to manage movies — built as a portfolio project to practice layered API design, dual database support (PostgreSQL & SQL Server), authentication (API key + JWT), Docker, and Azure SQL integration.

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
- [Testing & Scripts](#testing--scripts)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

## Features
- Full CRUD for movies (title, year, director, duration, poster, rate, genre).
- User lookup by ID or username (passwords never exposed).
- API key + JWT authentication with refresh tokens.
- Role-based access (`admin` required for movie mutations and listing all users).
- Dual database backends: PostgreSQL and SQL Server (Azure SQL).
- Repository pattern for swappable data access.
- OpenAPI/Swagger documentation at `/api/v1/api-docs`.
- Validation with Zod, centralized error handling, rate limiting, and a health endpoint.

## Tech Stack
- Node.js (ES Modules), Express 5
- PostgreSQL (`pg`) and SQL Server (`mssql`)
- Zod, bcrypt, jsonwebtoken, express-rate-limit, swagger-ui-express
- Docker, Vitest

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

3. Initialize the database (see [Database Initialization](#database-initialization)).

4. Run:

```bash
# PostgreSQL (default)
npm run dev:pg

# SQL Server
npm run dev:mssql
```

## Configuration
Environment variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_DATABASE` | Database name |
| `DB_HOST` | PostgreSQL host |
| `DB_SERVER` | SQL Server / Azure SQL host |
| `DB_DRIVER` | `postgres` or `mssql` |
| `API_KEY` | Required on every request (except Swagger UI) |
| `JWT_SECRET` | Secret used to sign access and refresh tokens |
| `PORT` | Server port (default `3000`) |
| `NODE_ENV` | `development` or `production` |

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

## Running
| Command | Description |
|---------|-------------|
| `npm run dev:pg` | Start with nodemon (PostgreSQL) |
| `npm run dev:mssql` | Start with nodemon (SQL Server) |
| `npm start` | Start in production mode (PostgreSQL) |
| `npm test` | Run Vitest unit tests |

## Docker
Build:

```bash
docker build -t movies-api .
```

Run (env file required):

```bash
docker run -d -p 8080:8080 --env-file .env --name movies-api movies-api
```

Defaults to `PORT=8080` and the PostgreSQL entrypoint.

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
| POST | `/auth/login` | API key | Authenticate and receive a JWT |
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

A `refreshToken` httpOnly cookie is set on login (path `/api/v1/auth`, 7-day expiry). Access tokens expire after 10 minutes.

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

Allowed genres: `Action`, `Adventure`, `Crime`, `Comedy`, `Drama`, `Fantasy`, `Horror`, `Thriller`, `Sci-Fi`.

### Users
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/user` | JWT | admin | List all users |
| GET | `/user/:id` | JWT | any | Get a user by ID |
| GET | `/user/:username` | JWT | any | Get a user by username |

User responses expose `id`, `username`, and `role` only — never passwords.

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

## Authentication
Every request must include an `api-key` header matching the `API_KEY` env variable. Swagger UI (`/api/v1/api-docs`) is the only exception.

Protected routes (`/movie`, `/user`) additionally require a Bearer JWT obtained from `/auth/login`. Tokens carry the user's `id`, `username`, and `role`.

| Role | Permissions |
|------|-------------|
| `user` | Read movies and look up users |
| `admin` | All `user` permissions plus create, update, delete movies and list all users |

Rate limiting is enabled globally: 20 requests per 15-minute window per IP.

## Testing & Scripts
```bash
npm test          # Run Vitest unit tests
npm run dev:pg    # Development server (PostgreSQL)
npm run dev:mssql # Development server (SQL Server)
npm start         # Production start (PostgreSQL)
```

## Security Notes
- Never commit `.env` with secrets. Use GitHub Actions secrets or Azure Key Vault in CI/CD.
- Rotate `API_KEY` and `JWT_SECRET` in production.
- Consider a migration tool (Flyway, Knex, etc.) instead of raw SQL scripts for production deployments.

## Contributing
Open an issue or pull request on [GitHub](https://github.com/joancubillo95/movies-api). For larger changes, describe the approach in an issue first.

## License
MIT — see [LICENSE](LICENSE).

## Acknowledgements
- Based on Miguel Ángel Durán — [curso-node-js](https://github.com/midudev/curso-node-js)
