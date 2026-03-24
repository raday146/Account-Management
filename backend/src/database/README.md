# Database Module

This folder contains database-related configuration and setup.

## TypeORM Configuration

TypeORM is configured with:
- PostgreSQL as the database driver
- Auto-load entities from `**/*.entity.ts` files
- Synchronize enabled in development (auto-creates tables)
- Logging enabled in development
- Environment variable support for connection settings

## Database Module

The `DatabaseModule` integrates TypeORM with NestJS using `TypeOrmModule.forRootAsync()` to access environment variables through `ConfigService`.

## Environment Variables

Required database environment variables:
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: account_management)

## Docker Setup

PostgreSQL runs in a Docker container. Start it with:

```bash
docker-compose up -d
```

## Creating Entities

When creating entities:
1. Create entity files with `.entity.ts` suffix in your module folders
2. Extend from TypeORM's `BaseEntity` or use `@Entity()` decorator
3. TypeORM will auto-load all entities based on the pattern in `typeorm.config.ts`
4. No need to manually register entities in the module

Example entity structure:
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('table_name')
export class YourEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```
