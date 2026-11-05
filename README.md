# User Mapping Service

This project is a NestJS implementation that maps an `(id1, id2)` pair to a
stable UUID v4 `userID`:

```text
(id1, id2) -> userID
```

Repeated requests with the same pair always return the same `userID`.

## Technology Stack

- NestJS 11 + TypeScript
- MySQL 8
- Redis 7
- TypeORM
- Jest
- Swagger/OpenAPI

## Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop (recommended for running MySQL and Redis)

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the configuration and set local development passwords:

   ```powershell
   Copy-Item .env.example .env
   ```

   Replace `MYSQL_PASSWORD` and `MYSQL_ROOT_PASSWORD` with passwords intended
   only for local development.

3. Start MySQL, Redis, and the application:

   ```bash
   docker compose up -d
   ```

   To start only the dependencies and run the application locally:

   ```bash
   docker compose up -d mysql redis
   npm run start:dev
   ```

The application is available at `http://localhost:3000`. Swagger is available
at `http://localhost:3000/docs`.

Inside Docker Compose, the application connects to `mysql` and `redis` by
service name. When running locally, it uses the `localhost` settings from
`.env`. MySQL is mapped to host port `3307` by default to avoid conflicts with
an existing MySQL instance on port `3306`; set `MYSQL_HOST_PORT` to change it.
The application does not provide a database password default and refuses to
start when `MYSQL_PASSWORD` is missing.

Compose builds the [`Dockerfile`](./Dockerfile) and waits for MySQL and Redis
health checks before starting the application.

## Configuration

`.env.example` contains placeholders only. Inject production credentials
through the deployment platform's secret or environment-variable management;
do not commit `.env`.

| Variable | Description |
|---|---|
| `PORT` | HTTP port, default `3000` |
| `MYSQL_HOST` / `MYSQL_PORT` | MySQL host and port for local application runs |
| `MYSQL_HOST_PORT` | Host port mapped to MySQL by Docker Compose, default `3307` |
| `MYSQL_DATABASE` | Database name |
| `MYSQL_USER` / `MYSQL_PASSWORD` | Application database credentials |
| `REDIS_HOST` / `REDIS_PORT` | Redis host and port |
| `REDIS_TTL_SECONDS` | Redis cache TTL |
| `DB_SYNCHRONIZE` | Whether TypeORM synchronizes the schema; keep `false` in production |

At startup, `PORT`, `MYSQL_PORT`, and `REDIS_PORT` must be integers from 1
through 65535, and `REDIS_TTL_SECONDS` must be a positive integer. Invalid
values stop the application from starting instead of causing a later runtime
failure.

## Database

On its first initialization, Docker runs
[`database/init.sql`](./database/init.sql). The table has these important
constraints:

- `id1` and `id2` are required;
- `(id1, id2)` has a composite unique index;
- `userID` has a unique index;
- InnoDB provides persistence and database-level concurrency guarantees.

## API

### `POST /user-mappings`

Request:

```json
{
  "id1": "ABC123",
  "id2": "XYZ456"
}
```

Response:

```json
{
  "userID": "550e8400-e29b-41d4-a716-446655440000"
}
```

Missing, blank, non-string, or unexpected fields return `400 Bad Request`.
Database failures return a controlled `500 Internal Server Error` without
exposing SQL statements or stack traces.

## Redis and Consistency

Redis caches `id1` + `id2` to `userID` lookups with a TTL. MySQL remains the
only permanent source of truth. If Redis reads or writes fail, the service logs
a warning and falls back to MySQL, so cache failures cannot change the result.

The service first checks for an existing record. For a new record, it relies on
the composite unique constraint. If two identical new requests run
concurrently, one insert succeeds and the other handles the duplicate-key
error by reading the winning record. Both requests ultimately return the same
`userID`.

## Testing and Building

```bash
npm test
npm run build
```

The tests cover new mappings, existing mappings, cache hits, concurrent
duplicate inserts, database errors, Redis failures, and request validation.

The default test suite does not require external services. After starting
Docker Compose, run the integration test against real MySQL and Redis:

```powershell
npm run test:integration
```

The integration test verifies UUID v4 generation, repeated-request
consistency, and concurrent-request consistency.

## Git and Security

`.gitignore` excludes `.env`, dependencies, build output, coverage, and logs.
`.env.example` contains placeholders only. Never commit real passwords, API
keys, or production credentials. Docker uses `npm ci` so that dependencies
match `package-lock.json`.

Run the production dependency audit with:

```bash
npm audit --omit=dev
```

The project pins patched transitive versions with npm `overrides`: Multer
`2.5.0`, Glob `14.0.2`, and Minimatch `11.0.1`. This removes the production
high-severity Multer denial-of-service issue and the TypeORM Glob/Minimatch
issues without a breaking NestJS or TypeORM upgrade. Development-only audit
findings belong to Jest and build tooling and are not included in the
production image.
