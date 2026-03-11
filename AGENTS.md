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

### Testing

```bash
# Run all tests (Vitest)
pnpm run test

# Run single test file
pnpm vitest run test/unit/user.usecases.spec.ts

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run all tests including integration
pnpm run test:all
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

### Docker

```bash
# Start containers
pnpm run docker:up

# Stop containers
pnpm run docker:down

# View logs
pnpm run docker:logs

# Run migrations in Docker
pnpm run docker:migrate
```

## Project Structure

```
src/
├── modules/
│   ├── security/
│   │   ├── auth/          # Authentication (login, JWT, Google OAuth)
│   │   ├── user/         # User management
│   │   ├── rol/          # Role/Permissions management
│   │   ├── audit/        # Audit logging
│   │   └── valid-permission/  # Permission guards
│   ├── files/            # File upload/delete
│   └── health/           # Health checks
├── config/               # Environment configuration
├── services/              # Global services (logger, email, config)
├── middlewares/          # Global middlewares
├── interceptors/         # Request/response interceptors
├── filters/              # Exception filters
├── functions/            # Utility functions
├── dto/                 # Global DTOs
├── decorators/           # Custom decorators
├── pipes/               # Custom pipes
└── app.module.ts        # Root module
```

## Code Style Guidelines

### Naming Conventions

- **Files**: `kebab-case.extension.ts` (e.g., `user.controller.ts`)
- **Classes**: `PascalCase` (e.g., `UserController`)
- **Variables/Functions**: `camelCase` (e.g., `findAllUsers`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (e.g., `UserDTO`)
- **Enums**: `PascalCase` starting with `E` (e.g., `EPermission`)
- **DTOs**: `NameDTO` (e.g., `UserRegisterDTO`)
- **Use Cases**: `NameUseCase` (e.g., `CreateUserUseCase`)

### Import Conventions

- Use path aliases with `@/` prefix (configured in tsconfig.json)
- Order imports: external libraries → internal modules → relative paths

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import {
	ApiTags,
	ApiBearerAuth,
	ApiResponse,
	ApiOperation,
} from '@nestjs/swagger';
import { LoggerService } from '@/services/logger.service';
import { UserRegisterDTO } from './dto/userRegister.dto';
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
- Each use case should have single responsibility
- Use `execute()` method as entry point
- Inject `LoggerService` for structured logging
- Inject repository through constructor

```typescript
@Injectable()
export class CreateUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly logger: LoggerService,
	) {}

	async execute(data: UserRegisterDTO): Promise<User> {
		this.logger.debug(`Creating user: ${data.email}`, { type: 'create_user' });
		// Business logic
		this.logger.info('User created successfully', {
			type: 'create_user',
			userId: user.uid,
		});
		return user;
	}
}
```

### Controller Guidelines

- Use `@ApiTags`, `@ApiBearerAuth`, `@ApiResponse`, `@ApiOperation` for Swagger
- Use proper HTTP status decorators (`@Get`, `@Post`, `@Patch`, `@Delete`)
- Use `@ThrottleAuth()` for sensitive endpoints
- Return meaningful HTTP responses

```typescript
@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCase) {}

	@ApiOperation({ summary: 'Create new user' })
	@ApiResponse({ status: 201, description: 'User created' })
	@Post()
	create(@Body() data: UserRegisterDTO) {
		return this.createUserUseCase.execute(data);
	}
}
```

### Error Handling

- Use NestJS built-in exceptions
- Use global exception filter for unhandled errors
- Validate input with class-validator

```typescript
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new NotFoundException('User not found');
```

### Logging Guidelines (IMPORTANT)

- Use **LoggerService** from `@/services/logger.service` for structured logging
- All messages must be in **Spanish**
- Include `type` in all log context
- Use metrics for important events

```typescript
constructor(private readonly logger: LoggerService) {}

// Debug - para desarrollo
this.logger.debug(`Creando usuario: ${email}`, { type: 'create_user' });

// Info - operaciones exitosas
this.logger.info('Usuario creado exitosamente', { type: 'create_user', userId: uid });

// Warn - advertencias
this.logger.warn('Login fallido - contraseña inválida', { type: 'auth_login', status: 'failed' });

// Error - errores
this.logger.error('Error al crear usuario', 'CreateUserUseCase', { type: 'create_user', error: err.message });

// Métricas
this.logger.logMetric('usuario.creado', 1, { email });
```

### Metrics Naming

Use Spanish metric names:

- `usuario.creado`, `usuario.actualizado`, `usuario.eliminado`
- `auth.login.exitoso`, `auth.login.fallido`, `auth.logout.exitoso`
- `rol.buscar_todos`, `auditoria.buscar_todos`

## Testing

- Place tests in `test/` directory
- Use Vitest (NOT Jest)
- Follow naming: `*.spec.ts` for unit tests
- Mock all dependencies in use case tests

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CreateUserUseCase', () => {
	let useCase: CreateUserUseCase;
	let mockUserRepository: any;
	let mockLoggerService: any;

	beforeEach(() => {
		mockUserRepository = { create: vi.fn() };
		mockLoggerService = {
			debug: vi.fn(),
			info: vi.fn(),
			error: vi.fn(),
			logMetric: vi.fn(),
		};
		useCase = new CreateUserUseCase(mockUserRepository, mockLoggerService);
	});

	it('should create user', async () => {
		// test implementation
	});
});
```

## Important Notes

1. **Vitest**: Uses Vitest for testing (NOT Jest)
2. **SWC Compiler**: Uses SWC for fast builds
3. **Oxlint**: Ultra-fast linter (not ESLint)
4. **Sequelize**: ORM with TypeScript support, not TypeORM
5. **Redis**: Used for caching with @keyv/redis

## Environment Variables

Required variables (see `.env.example`):

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=<64+ characters>
JWT_REFRESH_SECRET=<64+ characters>
DATABASE_DIALECT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<password>
POSTGRES_DB=api_nest
REDIS_URL=redis://localhost:6379
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
SALT_ROUNDS=10
CORS=http://localhost:5173
```

## Best Practices

1. Always validate input with DTOs
2. Use use cases for business logic (not controllers)
3. Use LoggerService with structured logging and Spanish messages
4. Include metrics for important operations
5. Handle errors consistently with exception filters
6. Follow single responsibility principle
7. Keep controllers thin, business logic in use cases
8. Use caching for frequently accessed data (roles, configs)
9. Apply rate limiting to sensitive endpoints
10. Use compression and Helmet for security
