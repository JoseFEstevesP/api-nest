# Guía de Desarrollo

## Configuración del Entorno

### Requisitos del Sistema

- **Node.js**: ≥24.4.1 (LTS recomendada)
- **pnpm**: ≥10.13.1
- **Docker**: Para PostgreSQL y Redis
- **Git**: Para control de versiones

### Instalación Inicial

1. **Clonar y configurar:**

```bash
git clone https://github.com/JoseFEstevesP/api-nest.git
cd api-nest
pnpm install
```

2. **Configurar variables de entorno:**

```bash
cp .env.example .env
# Editar .env con tus valores
```

3. **Iniciar servicios:**

```bash
docker-compose up -d
pnpm run migrate
```

4. **Ejecutar en desarrollo:**

```bash
pnpm run dev
```

## Estructura del Proyecto

### Directorios Principales

```
src/
├── config/           # Configuración de entorno
├── constants/        # Constantes globales
├── dto/             # DTOs compartidos
├── functions/       # Utilidades globales
├── middlewares/     # Middlewares globales
├── migrations/      # Migraciones de BD
├── modules/         # Módulos de la aplicación
├── services/        # Servicios globales
└── test/           # Utilidades de testing
```

### Convenciones de Nomenclatura

#### Archivos

- **Controllers**: `*.controller.ts`
- **Use Cases**: `*.use-case.ts`
- **DTOs**: `*.dto.ts`
- **Entities**: `*.entity.ts`
- **Tests**: `*.spec.ts` (unitarios), `*.e2e-spec.ts` (E2E)

#### Clases y Funciones

- **PascalCase**: Clases, interfaces, enums
- **camelCase**: Funciones, variables, propiedades
- **UPPER_SNAKE_CASE**: Constantes

## Flujo de Desarrollo

### 1. Crear un Nuevo Módulo

```bash
# Generar módulo con NestJS CLI
nest generate module modules/mi-modulo
nest generate controller modules/mi-modulo
```

### 2. Estructura del Módulo

```
modules/mi-modulo/
├── dto/
│   ├── create-item.dto.ts
│   └── update-item.dto.ts
├── entities/
│   └── item.entity.ts
├── repository/
│   └── item.repository.ts
├── use-case/
│   ├── create-item.use-case.ts
│   └── find-item.use-case.ts
├── item.controller.ts
└── item.module.ts
```

### 3. Implementar Caso de Uso

```typescript
@Injectable()
export class CreateItemUseCase {
	constructor(
		private readonly itemRepository: ItemRepository,
		private readonly auditService: CreateAuditUseCase,
	) {}

	async execute(data: CreateItemDto): Promise<Item> {
		// Validaciones de negocio
		await this.validateBusinessRules(data);

		// Crear item
		const item = await this.itemRepository.create(data);

		// Registrar auditoría
		await this.auditService.execute({
			action: 'CREATE_ITEM',
			resource: 'item',
			details: { itemId: item.uid },
		});

		return item;
	}
}
```

### 4. Crear Controller

```typescript
@Controller('item')
@UseGuards(JwtAuthGuard)
export class ItemController {
	constructor(private readonly createItemUseCase: CreateItemUseCase) {}

	@Post()
	@ValidPermission(['CREATE_ITEM'])
	async create(@Body() createItemDto: CreateItemDto) {
		const item = await this.createItemUseCase.execute(createItemDto);
		return { success: true, data: item };
	}
}
```

## Scripts de Desarrollo

### Comandos Principales

```bash
# Desarrollo con hot reload
pnpm run dev

# Build para producción
pnpm run build

# Ejecutar producción
pnpm run start:prod

# Linting y formato
pnpm run lint
pnpm run format
```

### Base de Datos

```bash
# Crear migración
npx sequelize-cli migration:generate --name create-table-name

# Ejecutar migraciones
pnpm run migrate

# Revertir migración
pnpm run migrate:undo
```

### Testing

```bash
# Tests unitarios
pnpm run test:unit

# Tests E2E
pnpm run test:e2e

# Cobertura
pnpm run test:cov
```

## Debugging

### VS Code Configuration

```json
{
	"type": "node",
	"request": "launch",
	"name": "Debug NestJS",
	"program": "${workspaceFolder}/src/main.ts",
	"runtimeArgs": ["-r", "@swc/register"],
	"env": {
		"NODE_ENV": "development"
	}
}
```

### Logs de Desarrollo

```typescript
// Usar el logger service
constructor(private readonly logger: LoggerService) {}

this.logger.debug('Debug message', { context: 'MyClass' });
this.logger.error('Error message', error.stack, 'MyClass');
```

## Validaciones y DTOs

### Crear DTO con Validaciones

```typescript
export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@Length(2, 50)
	name: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(8)
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
	password: string;
}
```

### Validaciones Personalizadas

```typescript
@ValidatorConstraint({ name: 'isUniqueEmail', async: true })
export class IsUniqueEmailConstraint implements ValidatorConstraintInterface {
	async validate(email: string) {
		const user = await User.findOne({ where: { email } });
		return !user;
	}
}
```

## Manejo de Errores

### Excepciones Personalizadas

```typescript
export class UserNotFoundException extends HttpException {
	constructor(userId: string) {
		super(
			{
				code: 'USER_NOT_FOUND',
				message: `Usuario con ID ${userId} no encontrado`,
			},
			HttpStatus.NOT_FOUND,
		);
	}
}
```

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		// Manejar diferentes tipos de errores
		const errorResponse = this.buildErrorResponse(exception);

		response.status(errorResponse.status).json(errorResponse);
	}
}
```

## Performance y Optimización

### Caché con Redis

```typescript
@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	async get<T>(key: string): Promise<T | null> {
		return await this.cacheManager.get(key);
	}

	async set(key: string, value: any, ttl: number = 300) {
		await this.cacheManager.set(key, value, ttl);
	}
}
```

### Paginación Eficiente

```typescript
async findAll(query: QueryDto) {
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  const { count, rows } = await Model.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  return {
    data: rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: limit
    }
  };
}
```

## Seguridad

### Validación de Permisos

```typescript
@ValidPermission(['READ_USER', 'ADMIN'])
@Get()
async findAll() {
  // Solo usuarios con permisos READ_USER o ADMIN
}
```

### Rate Limiting

```typescript
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Post('login')
async login() {
  // Máximo 10 intentos por minuto
}
```

## Git Workflow

### Commits Convencionales

```bash
feat: agregar endpoint de usuarios
fix: corregir validación de email
docs: actualizar documentación API
test: agregar tests para auth module
refactor: mejorar estructura de casos de uso
```

### Pre-commit Hooks

- **Linting**: Oxlint automático
- **Formato**: Prettier automático
- **Tests**: Ejecutar tests unitarios

### Branching Strategy

- `main`: Código de producción
- `develop`: Desarrollo activo
- `feature/*`: Nuevas características
- `fix/*`: Correcciones de bugs
- `hotfix/*`: Correcciones urgentes
