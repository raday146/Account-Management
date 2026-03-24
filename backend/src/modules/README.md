# Modules

This folder contains the application's feature modules.

Each module should encapsulate:
- Controllers for handling HTTP requests
- Services for business logic
- DTOs for data validation
- Entities for database models (if applicable)

Follow NestJS modular architecture principles.

## Current Modules

### Person Module
Contains the `PersonEntity` representing individuals.
- Location: `src/modules/person/`
- Entity: `person.entity.ts`

### Account Module
Contains the `AccountEntity` representing bank accounts.
- Location: `src/modules/account/`
- Entity: `account.entity.ts`

### Transaction Module
Contains the `TransactionEntity` representing financial transactions.
- Location: `src/modules/transaction/`
- Entity: `transaction.entity.ts`

## Entity Relationships

```
Person (1) ----< (M) Account (1) ----< (M) Transaction

- One Person can have many Accounts
- One Account belongs to one Person
- One Account can have many Transactions
- One Transaction belongs to one Account
```

See [ENTITIES.md](../../ENTITIES.md) for detailed entity documentation.
