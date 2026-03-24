# Gateway

This folder contains the API Gateway layer - the entry point for HTTP requests.

## Structure

```
gateway/
├── controllers/    # HTTP endpoint handlers
├── dto/           # Data Transfer Objects for validation
└── gateway.module.ts
```

## Controllers

### AccountController (`/accounts`)

HTTP endpoints for account management:

**Endpoints:**

- `POST /accounts` - Create a new account
- `POST /accounts/:id/deposit` - Deposit money
- `POST /accounts/:id/withdraw` - Withdraw money
- `GET /accounts/:id/balance` - Get account balance
- `PATCH /accounts/:id/block` - Block an account
- `GET /accounts/:id/statement` - Get account statement

## DTOs

Data Transfer Objects with validation:

- `CreateAccountDto` - For creating accounts
- `DepositDto` - For deposit operations
- `WithdrawDto` - For withdrawal operations
- `StatementQueryDto` - For filtering statements by date

All DTOs use `class-validator` decorators for input validation.

## Design Principles

**Controllers are thin** - Only handle HTTP layer  
 **No business logic** - All logic in services  
**Validation at gateway** - DTOs validate input  
 **Services for data** - Controllers call module services  
**Consistent responses** - All responses follow `{ success, message, data }` format  

## Module Dependencies

GatewayModule imports:

- `AccountModule` - For account operations
- `TransactionModule` - For transaction operations  
- `PersonModule` - For person validation

Controllers inject services from these modules via dependency injection.
