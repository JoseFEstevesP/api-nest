# AGENTS.md - Development Guidelines for API-Nest

## Overview

This is a NestJS REST API project using TypeScript, PostgreSQL, Redis, and Clean Architecture with Use Case pattern.

## Build, Lint, and Test Commands

### Installation & Running

```bash
# Install dependencies (uses pnpm)
pnpm install

# Development with hot reload
pnpm run dev

# Debug mode
pnpm run start:debug

# Production build
pnpm run build

# Run production build
pnpm run start:prod
```

### Linting & Formatting

```bash
# Lint code (oxlint)
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# Check lint without quiet mode
pnpm run lint:check

# Format code (prettier)
pnpm run format
```

### Database Migrations

```bash
# Run migrations
pnpm run migrate

# Create new migration
pnpm run migrate:create nombre-de-la-migracion

# Undo last migration
pnpm run migrate:undo

# Undo all migrations
pnpm run migrate:undo:all
```

### Module Generation

```bash
# Generate new module with all files
pnpm run module:generate nombre-del-modulo
```

## Project Structure

```
src/
├── modules/
│   ├── security/
│   │   ├── auth/          # Authentication (login, JWT, Google OAuth)
│   │   ├── user/          # User management
│   │   ├── rol/           # Role/Permissions management
│   │   ├── audit/         # Audit logging
│   │   └── valid-permission/  # Permission guards
│   ├── files/             # File upload/delete
│   └── health/            # Health checks
├── config/                # Environment configuration
├── services/              # Global services (logger, email, config)
├── middlewares/           # Global middlewares
├── interceptors/          # Request/response interceptors
├── filters/               # Exception filters
├── functions/             # Utility functions
├── dto/                   # Global DTOs
└── app.module.ts          # Root module
```

## Code Style Guidelines

### Naming Conventions

- **Files**: `kebab-case.extension.ts` (e.g., `user.controller.ts`)
- **Classes**: `PascalCase` (e.g., `UserController`)
- **Variables/Functions**: `camelCase` (e.g., `findAllUsers`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` with optional `I` prefix (e.g., `UserDTO`)
- **Enums**: `PascalCase` starting with `E` (e.g., `EPermission`)
- **DTOs**: `NameDTO` (e.g., `UserRegisterDTO`)
- **Use Cases**: `NameUseCase` (e.g., `CreateUserUseCase`)

### Import Conventions

- Use path aliases with `@/` prefix (configured in tsconfig.json)
- Order imports: external libraries → internal modules → relative paths
- Group imports logically in controllers

```typescript
// Example import order in controllers
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRegisterDTO } from './dto/userRegister.dto';
import { User } from './entities/user.entity';
import { CreateUserUseCase } from './use-case/createUser.use-case';
import { userMessages } from './user.messages';
```

### TypeScript Configuration

- Target: ES2021
- Module: commonjs
- Decorators: enabled (legacyDecorator + decoratorMetadata for Sequelize)
- Strict null checks: disabled
- Implicit any: allowed

### DTO Guidelines

- Use `class-validator` decorators for validation
- Use `@nestjs/swagger` `@ApiProperty` for OpenAPI documentation
- Always include `example` and `description` in `@ApiProperty`
- Use `readonly` for all properties
- Group validation decorators logically

```typescript
export class UserRegisterDTO {
	@ApiProperty({
		example: 'John',
		description: 'User first name',
	})
	@IsString()
	@IsNotEmpty()
	@Length(3, 255)
	readonly names: string;
}
```

### Entity Guidelines (Sequelize)

- Extend `Model<Entity>`
- Use `@Table` decorator
- Use `@Column` with explicit types
- Use `@ForeignKey` and `@BelongsTo` for relations
- Use `declare` for all properties

```typescript
@Table
export class User extends Model<User> {
	@Column({ primaryKey: true, type: DataType.UUID })
	declare uid: string;

	@ForeignKey(() => Role)
	@Column({ type: DataType.UUID })
	declare uidRol: string;

	@BelongsTo(() => Role)
	declare rol: Role;
}
```

### Use Case Pattern

- Create use case classes in `use-case/` directories
- Each use case should have a single responsibility
- Use `execute()` method as entry point
- Inject repository through constructor
- Return typed responses

```typescript
@Injectable()
export class CreateUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async execute(data: UserRegisterDTO): Promise<User> {
		// Business logic here
		return this.userRepository.create(user);
	}
}
```

### Controller Guidelines

- Use `@ApiTags`, `@ApiBearerAuth`, `@ApiResponse` for Swagger
- Use proper HTTP status decorators (`@Get`, `@Post`, `@Patch`, `@Delete`)
- Always use Logger with class name
- Extract user data from `@Req()` for auth context
- Return meaningful HTTP responses

```typescript
@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);

	@Post()
	create(@Body() data: UserRegisterDTO) {
		this.logger.log(`Creating user: ${data.email}`);
		return this.createUserUseCase.execute(data);
	}
}
```

### Error Handling

- Use NestJS built-in exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`)
- Use global exception filter for unhandled errors (see `src/filters/all-exceptions.filter.ts`)
- Validate input with class-validator
- Use custom validation functions for complex validations

```typescript
// Throwing errors
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentialsFoundException('User');
throw new Not not found');
```

### Logging

- Use `Logger` from `@nestjs/common` in services and controllers
- Use custom `LoggerService` for structured logging with Winston
- Include correlation IDs for request tracing

```typescript
private readonly logger = new Logger(ClassName.name);
// or
constructor(private readonly logger: LoggerService) {}
```

### Authentication & Authorization

- Use JWT strategy with Passport
- Protect routes with `@UseGuards(JwtAuthGuard, PermissionsGuard)`
- Define permissions with `@ValidPermission(Permission.name)`
- Use `@ReqUidDTO` to extract user data from JWT

```typescript
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ValidPermission(Permission.userRead)
@Get()
findAll(@Req() req: ReqUidDTO) {
  const { uid } = req.user;
  // ...
}
```

### Configuration

- All config goes through `ConfigService`
- Use typed environment variables (see `src/config/env.config.ts`)
- Validate env on startup with `validateEnv`

### Testing

- Place tests in `test/` directory
- Follow naming: `*.spec.ts` for unit tests
- Use `@nestjs/testing` utilities
- Mock repositories and services

## Important Notes

1. **No Jest**: This project uses NestJS testing utilities but no explicit test runner is configured in package.json
2. **SWC Compiler**: Uses SWC for fast builds (configured in `.swcrc`)
3. **Oxlint**: Ultra-fast linter (not ESLint)
4. **Husky**: Pre-commit hooks run lint-staged
5. **Sequelize**: ORM with TypeScript support, not TypeORM

## Environment Variables

Required variables (see `.env.example`):

- `PORT`, `NODE_ENV`, `CORS`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `DATABASE_*`, `POSTGRES_*`
- `REDIS_URL`
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
- `RATE_LIMIT_TTL`, `RATE_LIMIT_LIMIT`

## Best Practices

1. Always validate input with DTOs
2. Use use cases for business logic (not controllers)
3. Log important actions with context
4. Use correlation IDs for request tracing
5. Handle errors consistently with exception filters
6. Follow single responsibility principle
7. Keep controllers thin, business logic in use cases
