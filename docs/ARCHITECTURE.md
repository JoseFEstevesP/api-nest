# Arquitectura del Proyecto

## Patrón de Casos de Uso

Este proyecto implementa el patrón **Use Case** (Casos de Uso) para organizar la lógica de negocio, alejándose del patrón tradicional de servicios monolíticos.

### Beneficios del Patrón

- **Principio de Responsabilidad Única**: Cada caso de uso maneja una operación específica
- **Mejor Testabilidad**: Casos de uso aislados y fáciles de probar
- **Mantenibilidad**: Cambios localizados con menor impacto
- **Legibilidad**: Lógica de negocio clara y bien definida
- **Reutilización**: Casos de uso pueden ser reutilizados en diferentes contextos

### Estructura de un Módulo

```
modules/security/user/
├── dto/                    # Objetos de transferencia de datos
├── entities/              # Modelos de Sequelize
├── repository/            # Acceso a datos
├── use-case/             # Lógica de negocio
├── user.controller.ts    # Controlador HTTP
└── user.module.ts        # Módulo NestJS
```

### Flujo de Datos

```
Request → Controller → Use Case → Repository → Database
                   ↓
Response ← Controller ← Use Case ← Repository ← Database
```

## Módulos Principales

### Security Module
Contiene toda la funcionalidad relacionada con seguridad:

#### Auth Module
- **Responsabilidad**: Autenticación y autorización
- **Casos de Uso**:
  - `LoginUseCase`: Autenticación de usuarios
  - `LogoutUseCase`: Cierre de sesión
  - `RefreshTokenUseCase`: Renovación de tokens

#### User Module
- **Responsabilidad**: Gestión de usuarios
- **Casos de Uso**:
  - `CreateUserUseCase`: Registro de usuarios
  - `FindAllUsersUseCase`: Listado paginado
  - `UpdateUserProfileUseCase`: Actualización de perfil
  - `RecoveryPasswordUseCase`: Recuperación de contraseña

#### Rol Module
- **Responsabilidad**: Gestión de roles y permisos
- **Casos de Uso**:
  - `CreateRolUseCase`: Creación de roles
  - `FindRolPermissionsUseCase`: Consulta de permisos

#### Audit Module
- **Responsabilidad**: Registro de auditoría
- **Casos de Uso**:
  - `CreateAuditUseCase`: Registro de eventos
  - `CleanUpOldAuditsUseCase`: Limpieza automática

### Files Module
- **Responsabilidad**: Gestión de archivos
- **Casos de Uso**:
  - `SaveFileUseCase`: Subida de archivos
  - `DeleteFileUseCase`: Eliminación de archivos

## Capas de la Aplicación

### 1. Presentation Layer (Controllers)
- Maneja requests HTTP
- Validación de entrada
- Formateo de respuestas
- Delegación a casos de uso

### 2. Application Layer (Use Cases)
- Lógica de negocio
- Orquestación de operaciones
- Validaciones de negocio
- Manejo de transacciones

### 3. Infrastructure Layer (Repositories)
- Acceso a datos
- Implementación de persistencia
- Queries específicas
- Manejo de conexiones

### 4. Domain Layer (Entities)
- Modelos de dominio
- Reglas de negocio
- Validaciones de entidad

## Patrones Implementados

### Repository Pattern
Abstrae el acceso a datos y permite cambiar la implementación sin afectar la lógica de negocio.

```typescript
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }
}
```

### Dependency Injection
NestJS maneja automáticamente las dependencias entre componentes.

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: CreateAuditUseCase
  ) {}
}
```

### Guard Pattern
Protege endpoints con validaciones de autenticación y autorización.

```typescript
@UseGuards(JwtAuthGuard, ValidPermissionGuard)
@ValidPermission(['CREATE_USER'])
@Post('protect')
async createProtectUser() {}
```

## Middleware y Interceptors

### Correlation ID Middleware
Genera IDs únicos para rastrear requests a través del sistema.

### Rate Limiting
Protege contra abuso con límites de requests por IP.

### Cache Manager
Mejora performance con caché Redis para datos frecuentemente accedidos.

### Logger Service
Registro estructurado de eventos con rotación diaria de archivos.

## Base de Datos

### ORM: Sequelize
- Migraciones versionadas
- Modelos tipados con TypeScript
- Transacciones automáticas
- Validaciones a nivel de modelo

### Estructura de Tablas
```sql
Users (uid, name, email, password, status, rolUid)
Roles (uid, name, description, permissions)
Audits (uid, action, resource, userId, details, createdAt)
```

## Seguridad

### Autenticación JWT
- Access tokens de corta duración (15 min)
- Refresh tokens de larga duración (7 días)
- Rotación automática de tokens

### Hashing de Contraseñas
- Bcrypt con salt rounds configurables
- Validación de fortaleza de contraseña

### Validación de Permisos
- Sistema RBAC (Role-Based Access Control)
- Guards personalizados para endpoints
- Permisos granulares por operación

## Configuración

### Variables de Entorno
Configuración centralizada con validación de tipos:

```typescript
export class EnvConfig {
  @IsString()
  JWT_SECRET: string;
  
  @IsNumber()
  @Min(1000)
  PORT: number;
}
```

### Configuración por Ambiente
- Development: Hot reload, logs detallados
- Production: Optimizaciones, logs estructurados
- Test: Base de datos en memoria, mocks

## Monitoreo y Observabilidad

### Logging
- Logs estructurados en JSON
- Rotación diaria de archivos
- Niveles: error, warn, info, debug

### Auditoría
- Registro automático de acciones críticas
- Información de contexto (IP, User-Agent)
- Limpieza automática de registros antiguos

### Health Checks
- Endpoint `/health` para monitoreo
- Verificación de conexiones (DB, Redis)
- Métricas de sistema