# Guía de Contribución

## Bienvenido

Gracias por tu interés en contribuir a este proyecto. Esta guía te ayudará a entender cómo participar de manera efectiva.

## Código de Conducta

- Sé respetuoso y profesional en todas las interacciones
- Acepta críticas constructivas y proporciona feedback útil
- Enfócate en lo que es mejor para la comunidad
- Muestra empatía hacia otros miembros de la comunidad

## Cómo Contribuir

### Reportar Bugs

1. **Verifica** que el bug no haya sido reportado anteriormente
2. **Usa** la plantilla de issue para bugs
3. **Incluye** información detallada:
   - Versión de Node.js y pnpm
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica

### Sugerir Mejoras

1. **Abre** un issue con la etiqueta "enhancement"
2. **Describe** claramente la mejora propuesta
3. **Explica** por qué sería útil para el proyecto
4. **Considera** el impacto en la compatibilidad

### Contribuir Código

#### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
git clone https://github.com/JoseFEstevesP/api-nest.git
cd api-nest
```

#### 2. Configurar Entorno

```bash
pnpm install
cp .env.example .env
docker-compose up -d
pnpm run migrate
```

#### 3. Crear Branch

```bash
git checkout -b feature/mi-nueva-caracteristica
# o
git checkout -b fix/correccion-bug
```

#### 4. Hacer Cambios

- Sigue las convenciones de código existentes
- Escribe tests para nuevas funcionalidades
- Actualiza documentación si es necesario

#### 5. Commit

```bash
# Usar commits convencionales
git commit -m "feat: agregar endpoint de notificaciones"
git commit -m "fix: corregir validación de email"
git commit -m "docs: actualizar guía de API"
```

#### 6. Push y Pull Request

```bash
git push origin feature/mi-nueva-caracteristica
```

Luego crea un Pull Request en GitHub.

## Estándares de Código

### Convenciones de Nomenclatura

```typescript
// Clases - PascalCase
class UserService {}
class CreateUserUseCase {}

// Funciones y variables - camelCase
const findUserById = () => {};
const userData = {};

// Constantes - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024;
const DEFAULT_PAGE_SIZE = 10;

// Archivos - kebab-case
user.controller.ts
create-user.use-case.ts
user-register.dto.ts
```

### Estructura de Archivos

```typescript
// 1. Imports externos
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

// 2. Imports internos
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// 3. Clase principal
@Injectable()
export class CreateUserUseCase {
	constructor(
		@InjectModel(User)
		private readonly userModel: typeof User,
	) {}

	async execute(data: CreateUserDto): Promise<User> {
		// Implementación
	}

	private async validateBusinessRules(data: CreateUserDto): Promise<void> {
		// Validaciones privadas
	}
}
```

### DTOs y Validaciones

```typescript
export class CreateUserDto {
	@ApiProperty({ description: 'Nombre del usuario' })
	@IsString()
	@IsNotEmpty()
	@Length(2, 50)
	name: string;

	@ApiProperty({ description: 'Email único del usuario' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ description: 'Contraseña (mín. 8 caracteres)' })
	@IsString()
	@MinLength(8)
	@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
		message:
			'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
	})
	password: string;
}
```

### Casos de Uso

```typescript
@Injectable()
export class CreateUserUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly auditService: CreateAuditUseCase,
		private readonly logger: LoggerService,
	) {}

	async execute(
		data: CreateUserDto,
		context?: ExecutionContext,
	): Promise<User> {
		try {
			// 1. Validaciones de negocio
			await this.validateBusinessRules(data);

			// 2. Operación principal
			const user = await this.userRepository.create(data);

			// 3. Efectos secundarios
			await this.auditService.execute({
				action: 'CREATE_USER',
				resource: 'user',
				userId: context?.userId,
				details: { createdUserId: user.uid },
			});

			// 4. Log y retorno
			this.logger.info('Usuario creado exitosamente', {
				userId: user.uid,
				email: user.email,
			});

			return user;
		} catch (error) {
			this.logger.error('Error al crear usuario', error.stack);
			throw error;
		}
	}

	private async validateBusinessRules(data: CreateUserDto): Promise<void> {
		const existingUser = await this.userRepository.findByEmail(data.email);
		if (existingUser) {
			throw new ConflictException('El email ya está registrado');
		}
	}
}
```

## Testing

### Tests Unitarios

```typescript
describe('CreateUserUseCase', () => {
	let useCase: CreateUserUseCase;
	let userRepository: jest.Mocked<UserRepository>;
	let auditService: jest.Mocked<CreateAuditUseCase>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CreateUserUseCase,
				{
					provide: UserRepository,
					useValue: {
						create: jest.fn(),
						findByEmail: jest.fn(),
					},
				},
				{
					provide: CreateAuditUseCase,
					useValue: {
						execute: jest.fn(),
					},
				},
			],
		}).compile();

		useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
		userRepository = module.get(UserRepository);
		auditService = module.get(CreateAuditUseCase);
	});

	describe('execute', () => {
		it('debería crear un usuario exitosamente', async () => {
			// Arrange
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'Password123',
			};
			const expectedUser = { uid: 'uuid', ...userData };

			userRepository.findByEmail.mockResolvedValue(null);
			userRepository.create.mockResolvedValue(expectedUser as User);

			// Act
			const result = await useCase.execute(userData);

			// Assert
			expect(result).toEqual(expectedUser);
			expect(userRepository.create).toHaveBeenCalledWith(userData);
			expect(auditService.execute).toHaveBeenCalled();
		});

		it('debería lanzar error si el email ya existe', async () => {
			// Arrange
			const userData = {
				name: 'Test User',
				email: 'existing@example.com',
				password: 'Password123',
			};

			userRepository.findByEmail.mockResolvedValue({} as User);

			// Act & Assert
			await expect(useCase.execute(userData)).rejects.toThrow(
				ConflictException,
			);
		});
	});
});
```

### Tests E2E

```typescript
describe('UserController (e2e)', () => {
	let app: INestApplication;
	let authToken: string;

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Obtener token de autenticación
		const loginResponse = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email: 'admin@test.com',
				password: 'password123',
			});

		authToken = loginResponse.body.data.tokens.accessToken;
	});

	describe('/user (POST)', () => {
		it('debería crear un usuario', async () => {
			const userData = {
				name: 'Test User',
				email: 'test@example.com',
				password: 'Password123',
			};

			const response = await request(app.getHttpServer())
				.post('/user')
				.send(userData)
				.expect(201);

			expect(response.body.success).toBe(true);
			expect(response.body.data.email).toBe(userData.email);
		});
	});
});
```

## Documentación

### Swagger/OpenAPI

```typescript
@ApiTags('users')
@Controller('user')
export class UserController {
	@ApiOperation({ summary: 'Crear nuevo usuario' })
	@ApiResponse({
		status: 201,
		description: 'Usuario creado exitosamente',
		type: User,
	})
	@ApiResponse({
		status: 409,
		description: 'Email ya registrado',
	})
	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		// Implementación
	}
}
```

### Comentarios en Código

````typescript
/**
 * Caso de uso para crear nuevos usuarios en el sistema
 *
 * @description Este caso de uso maneja la creación de usuarios,
 * incluyendo validaciones de negocio, hash de contraseñas y
 * registro de auditoría.
 *
 * @example
 * ```typescript
 * const user = await createUserUseCase.execute({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123'
 * });
 * ```
 */
@Injectable()
export class CreateUserUseCase {
	/**
	 * Ejecuta la creación de un nuevo usuario
	 *
	 * @param data - Datos del usuario a crear
	 * @param context - Contexto de ejecución (opcional)
	 * @returns Promise<User> - Usuario creado
	 * @throws ConflictException - Si el email ya existe
	 * @throws ValidationException - Si los datos son inválidos
	 */
	async execute(
		data: CreateUserDto,
		context?: ExecutionContext,
	): Promise<User> {
		// Implementación
	}
}
````

## Proceso de Review

### Checklist para Pull Requests

- [ ] El código sigue las convenciones del proyecto
- [ ] Se agregaron tests para nuevas funcionalidades
- [ ] Todos los tests pasan
- [ ] La documentación está actualizada
- [ ] No hay conflictos de merge
- [ ] El commit message sigue las convenciones
- [ ] Se probó manualmente la funcionalidad

### Criterios de Aceptación

1. **Funcionalidad**: El código hace lo que se supone que debe hacer
2. **Tests**: Cobertura adecuada y tests que pasan
3. **Performance**: No introduce regresiones de rendimiento
4. **Seguridad**: No introduce vulnerabilidades
5. **Mantenibilidad**: Código limpio y bien documentado

## Versionado

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs compatibles

## Releases

### Proceso de Release

1. **Crear branch de release**:

```bash
git checkout -b release/v1.2.0
```

2. **Actualizar versión**:

```bash
# package.json
"version": "1.2.0"
```

3. **Actualizar CHANGELOG.md**:

```markdown
## [1.2.0] - 2024-01-15

### Added

- Nueva funcionalidad de notificaciones
- Endpoint para gestión de archivos

### Fixed

- Corrección en validación de emails
- Mejora en manejo de errores

### Changed

- Actualización de dependencias
```

4. **Merge y tag**:

```bash
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags
```

## Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Guía de TypeScript](https://www.typescriptlang.org/docs/)
- [Convenciones de Commit](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Contacto

Si tienes preguntas sobre cómo contribuir, puedes:

- Abrir un issue con la etiqueta "question"
- Contactar a los mantenedores del proyecto
- Revisar la documentación existente

¡Gracias por contribuir! 🚀
