# Account Management

A NestJS application built with TypeScript and PostgreSQL.

## Project Structure

```
src/
├── modules/     # Feature modules
├── gateway/     # WebSocket gateways
├── common/      # Shared utilities, guards, filters, interceptors
├── config/      # Configuration and environment validation
├── database/    # Database configuration and setup (TypeORM)
└── main.ts      # Application entry point
```

## Prerequisites

- Node.js (>= 20.x)
- npm
- Docker and Docker Compose

## Installation

```bash
npm install
```

## Database Setup

Start PostgreSQL using Docker:

```bash
docker-compose up -d
```

See [DATABASE.md](./DATABASE.md) for detailed database setup instructions.

## Environment Variables

Copy `.env.example` to `.env` and configure the required environment variables:

```bash
cp .env.example .env
```

Required variables:
- `PORT` - Application port (default: 3001)
- `NODE_ENV` - Environment (development/production/test)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

## Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Code Quality

```bash
# lint
npm run lint

# format
npm run format
```

## Build

```bash
npm run build
```

## Docker Commands

```bash
# Start database
docker-compose up -d

# View database logs
docker-compose logs -f postgres

# Stop database
docker-compose down

# Stop and remove data
docker-compose down -v
```

## License

UNLICENSED
