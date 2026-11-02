# Account Management System

Full-stack banking-style account manager: create accounts, deposit, withdraw, check balances, block accounts, and browse filtered transaction statements. Built with NestJS, React, and PostgreSQL; runs end to end with one `docker-compose` command.

The focus is **money-handling correctness**: exact decimal arithmetic, atomic transactions, and row-level locking so concurrent requests can't corrupt a balance or bypass the daily withdrawal limit.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS 11, TypeScript, class-validator / class-transformer |
| Frontend | React 18, TypeScript, Vite, Yarn |
| Database | PostgreSQL 16, TypeORM |
| Infrastructure | Docker, Docker Compose |
| Testing | Jest, ts-jest |

## Features

- **Account lifecycle** - create accounts linked to a person, with a configurable daily withdrawal limit; block an account to reject further operations.
- **Deposits & withdrawals** - withdrawals enforce sufficient balance and the daily limit.
- **Statements** - required date range, optional deposit/withdrawal filter, pagination.
- **Validation** - DTO validation on every request (`class-validator`) and typed env validation at startup; failures return proper HTTP status codes and clear messages.
- **Concurrency safety** - each balance change runs in a DB transaction with a pessimistic lock (`SELECT ... FOR UPDATE`) and in-transaction checks.
- **Exact money** - stored as `DECIMAL(10,2)`, handled as strings in TypeScript to avoid floating-point drift.
- **Frontend state** - plain React component state, one page per operation, a single typed API service layer.
- **Containerized** - database, API, and UI start together with health-checked dependencies.

## Architecture

```text
.
├── backend/                 # NestJS API
│   └── src/
│       ├── modules/         # Domain: account, person, transaction (entities + services)
│       ├── gateway/         # HTTP layer: controllers + DTOs
│       ├── config/          # Env loading and validation
│       ├── common/          # Shared types and constants
│       └── database/        # TypeORM config and seed script
├── frontend/                # React + Vite
│   └── src/
│       ├── pages/           # One page per operation
│       ├── services/        # Typed API client
│       └── types/
└── docker-compose.yml       # db + backend + frontend
```

Controllers stay thin: they validate input via DTOs and delegate to domain services. Business rules and persistence live in `modules/`.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose
- [Node.js](https://nodejs.org/) >= 18.12 (20+ recommended) - needed for the seed script, and for running locally without Docker
- [Yarn](https://yarnpkg.com/) - only for running the frontend locally without Docker

### 1. Clone

```bash
git clone https://github.com/raday146/Account-Management.git
cd Account-Management
```

### 2. Configure environment

No credentials ship with this repo. Create your own `.env` files from the templates (both are git-ignored):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and replace the `your_db_*` placeholders with any user, password, and database name you like - Docker creates the database with whatever you set.

### 3a. Run with Docker Compose (recommended)

```bash
docker-compose --env-file backend/.env up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:5173> |
| Backend API | <http://localhost:3000> |
| PostgreSQL | `localhost:5432` |

Seed the database (3 persons, 1 account, sample transactions). The seed runs on your machine and connects through the exposed Postgres port:

```bash
cd backend
npm install
npm run seed
```

### 3b. Run locally (without Docker for the app)

You still need a PostgreSQL instance matching `backend/.env`. The quickest way is to start only the database container:

```bash
docker-compose --env-file backend/.env up -d db
```

Then, in two terminals:

```bash
# Terminal 1 - API (http://localhost:3000)
cd backend
npm install
npm run seed         # first run only
npm run start:dev
```

```bash
# Terminal 2 - UI (http://localhost:5173)
cd frontend
yarn install
yarn dev
```

With a local `DB_HOST=localhost` in `backend/.env` (the template default), no further changes are needed.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/persons` | List persons |
| `POST` | `/accounts` | Create an account |
| `POST` | `/accounts/:id/deposit` | Deposit funds |
| `POST` | `/accounts/:id/withdraw` | Withdraw funds (balance + daily limit enforced) |
| `GET` | `/accounts/:id/balance` | Get current balance |
| `PATCH` | `/accounts/:id/block` | Block an account |
| `GET` | `/accounts/:id/statement` | Get transaction statement |

**Statement query params:** `from` and `to` (required, `YYYY-MM-DD`), `page`, `limit`, `type` (`deposit` \| `withdrawal`).

## Data Model

| Entity | Key fields |
|--------|------------|
| Person | `personId`, `name`, `document` (unique), `birthDate` |
| Account | `accountId`, `personId` (FK), `balance`, `dailyWithdrawalLimit`, `activeFlag`, `accountType` (1 checking, 2 savings), `createDate` |
| Transaction | `transactionId`, `accountId` (FK), `value` (positive = deposit, negative = withdrawal), `transactionDate` |

## Testing & Quality

```bash
cd backend
npm test         # unit tests: withdraw rules, deposits, statement filtering, blocking
npm run lint
npm run build

cd ../frontend
yarn lint        # type check
yarn build
```

## Useful Docker Commands

```bash
docker-compose logs -f                              # follow logs
docker-compose down                                 # stop
docker-compose down -v                              # stop and wipe database volume
docker-compose --env-file backend/.env up -d --build  # rebuild
```

## Troubleshooting

- **`Set DB_NAME in backend/.env` (or similar) on startup** - you skipped step 2, or didn't pass `--env-file backend/.env`.
- **Backend can't reach the database** - check `docker-compose ps` and `docker-compose logs db`; credentials in `backend/.env` must match what the database volume was first created with (use `docker-compose down -v` to reset).
- **Port already in use** - free ports 3000, 5173, or 5432, or change the mappings in `docker-compose.yml`.
- **Frontend can't reach the API** - confirm `VITE_API_URL` in `frontend/.env` matches the backend URL.
- **Seed fails** - the database must be running and `backend/.env` filled in; the script skips records that already exist.

## Design Notes

- **Monorepo** - backend and frontend share one repo, one compose file, and one setup flow.
- **Schema sync** - TypeORM `synchronize` is enabled in development only; use migrations before any production deployment.

## License

[MIT](LICENSE) © Shlomo Raday
