# Movies API

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js CI](https://img.shields.io/badge/ci-github_actions-blue)](#) <!-- replace with real badge -->
[![Docker Image](https://img.shields.io/badge/docker-ready-blue)](#) <!-- optional -->

A Node.js REST API to manage movies — built as a portfolio project to practice layered API design, dual database support (Postgres & SQL Server), authentication (API key + JWT), Docker, and Azure SQL integration.

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
- [Contributing](#contributing)
- [License](#license)

## Features
- Full CRUD for movies (title, year, director, duration, poster, rate, genre).
- User management with hashed passwords.
- API key + JWT authentication.
- Dual database backends: PostgreSQL and SQL Server (Azure SQL).
- Repository pattern for swappable data access.
- Validation with Zod, centralized error handling, rate limiting, health endpoint.
- Docker support.

## Tech Stack
- Node.js (ES Modules), Express 5
- PostgreSQL (`pg`) and SQL Server (`mssql`)
- Zod, bcrypt, jsonwebtoken, express-rate-limit
- Docker

## Quick Start (local)
1. Clone and install:

```bash
git clone https://github.com/joancubillo95/movies-api.git
cd movies-api
npm install
```

2. Copy and edit env:

```bash
cp .env.example .env
# Fill DB_USER, DB_PASSWORD, DB_DATABASE, DB_HOST/DB_SERVER, API_KEY, JWT_SECRET, PORT
```

3. Initialize database (see Database Initialization below).

4. Run:

```bash
# PostgreSQL
node src/server/pgServer.js
# or SQL Server
node src/server/mssqlServer.js
```

## Configuration
- .env variables (see `.env.example`)
  - DB_USER, DB_PASSWORD, DB_DATABASE
  - DB_HOST (Postgres), DB_SERVER (MSSQL)
  - API_KEY, JWT_SECRET
  - PORT (default 3000), NODE_ENV

## Database Initialization
- PostgreSQL: run SQL files in `db/postgres/` in order:
  - 001_schema.sql
  - 002_stored_procedures.sql
- SQL Server: run `db/mssql/` in order:
  - 001_schema.sql
  - 002_views.sql
  - 003_stored_procedures.sql

## Running in development
- Use nodemon:

```bash
npx nodemon src/server/pgServer.js
npx nodemon src/server/mssqlServer.js
```

## Docker
- Build:

```bash
docker build -t movies-api .
```

- Run (env file required):

```bash
docker run -d -p 8080:8080 --env-file .env --name movies-api movies-api
```

- Defaults to `PORT=8080` and the PostgreSQL entrypoint; override env or args as needed.

## API Reference (high level)
Base URL: http://localhost:<PORT>

### Health
- GET / — returns API version and server time (no auth)

### Auth
- POST /auth/login
  Request headers:
    Content-Type: application/json
    api-key: YOUR_API_KEY
  Body:
  {
    "username": "your_username",
    "password": "your_password"
  }
  Response:
  {
    "token": "eyJ..."
  }

### Movies
- GET /movies — list movies (protected)
- POST /movies — create movie (protected)
- GET /movies/:id — get single movie
- PUT /movies/:id — replace movie
- PATCH /movies/:id — partial update
- DELETE /movies/:id — delete movie

### Example: Login (curl)

```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{"username":"user","password":"pass"}'
```

### Example: List movies (curl)

```bash
curl -X GET "http://localhost:3000/movies" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "api-key: YOUR_API_KEY"
```

Allowed genres: Action, Adventure, Crime, Comedy, Drama, Fantasy, Horror, Thriller, Sci-Fi.

## Testing & Scripts
- Add useful npm scripts to `package.json` if missing (suggested):
  - "start": "node src/server/pgServer.js"
  - "start:mssql": "node src/server/mssqlServer.js"
  - "dev": "nodemon src/server/pgServer.js"
  - "lint": "eslint ."
  - "test": "jest"

## Suggestions for improving documentation further
- Add badges (CI, coverage, npm version, license, Docker Hub) with real badge URLs.
- Provide a minimal example .env snippet and a sanitized `.env.example`.
- Add explicit curl/Postman examples for each endpoint (request + sample response).
- Publish an OpenAPI/Swagger or Postman collection and link it (helps users & clients).
- Add a "Development" section showing key scripts in package.json (start, dev, test, lint).
- Add a "Tests" section and CI config (GitHub Actions) with badges.
- Add a "Contributing" section with guidelines and CLA/Code of Conduct if needed.
- Add "Roadmap" or "Planned features" and a contact/maintainer line.
- Mention supported Node.js versions and any performance or security notes (e.g., storing secrets).
- Provide a database migrations approach or explain how to re-run SQL scripts safely.
- Add examples using docker-compose for a full-stack local dev (postgres + app).
- Add quick troubleshooting tips (common startup errors, DB connection issues).

## Security and maintenance notes
- Never commit .env with secrets. Use GitHub Actions secrets / Azure Key Vault in CI/CD.
- Consider using migrations (e.g., Flyway/Knex/TypeORM migrations) instead of SQL scripts for production.
- Ensure rate limit, input validation, and JWT secrets are rotated in production.

## Contributing
- If you'd like, add a CONTRIBUTING.md and CODE_OF_CONDUCT.md. Provide instructions for opening issues and PRs, and a short PR checklist.

## License
MIT — see LICENSE

## Acknowledgements
- Based on Miguel Ángel Durán — [curso-node-js](https://github.com/midudev/curso-node-js)
