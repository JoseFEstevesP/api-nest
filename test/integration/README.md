# Tests de Integración y Unitarios - Módulos User, Rol, Auth, Audit y Files

Este directorio contiene los tests de integración y unitarios para los módulos de usuarios, roles, autenticación, auditoría y archivos.

## Requisitos

- Docker corriendo con los contenedores de PostgreSQL y Redis
- Variables de entorno configuradas en `.env.test`

## Configuración

### 1. Iniciar los contenedores Docker

```bash
pnpm run docker:up
```

### 2. Configurar variables de entorno

El archivo `.env.test` contiene la configuración para los tests:

```env
NODE_ENV=test
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_USER=api_nest
POSTGRES_PASSWORD=api_nest
POSTGRES_DB=test_db
```

## Ejecutar Tests

### Todos los tests (auto-configura la base de datos)

```bash
pnpm run test
```

> **Nota:** El comando `pnpm run test` ejecuta automáticamente `setup:test-db` antes de los tests, lo que crea la base de datos `test_db` si no existe.

> **Importante:** Los tests se ejecutan en secuencia (no en paralelo) para evitar contaminación de la base de datos entre suites de tests.

### Solo setup de la base de datos

```bash
pnpm run setup:test-db
```

### Tests específicos

#### User Repository Integration
```bash
pnpm run test -- test/integration/user.repository.integration.spec.ts
```

#### Rol Repository Integration
```bash
pnpm run test -- test/integration/rol.repository.integration.spec.ts
```

#### User Repository Unit
```bash
pnpm run test -- test/unit/user.repository.spec.ts
```

#### Auth Use Cases Integration
```bash
pnpm run test -- test/integration/auth.usecases.integration.spec.ts
```

#### Audit Use Cases Integration
```bash
pnpm run test -- test/integration/audit.usecases.integration.spec.ts
```

#### Files Use Cases Unit
```bash
pnpm run test -- test/unit/files.usecases.spec.ts
```

#### Health Controller Unit
```bash
pnpm run test -- test/unit/health.controller.spec.ts
```

#### Valid-Permission Unit
```bash
pnpm run test -- test/unit/valid-permission.spec.ts
```

### Tests con coverage

```bash
pnpm run test:cov
```

## Estructura de Tests

### User Repository Integration (`test/integration/user.repository.integration.spec.ts`)

Tests de integración para el `UserRepository` que verifican:

- **create**: Creación de usuarios y manejo de restricciones únicas
- **findOne**: Búsqueda de usuarios por email, con inclusión de roles
- **findAll**: Obtención de todos los usuarios
- **findAndCountAll**: Paginación y filtrado de usuarios
- **update**: Actualización de usuarios
- **delete**: Eliminación de usuarios
- **transaction**: Ejecución de operaciones dentro de transacciones

### Rol Repository Integration (`test/integration/rol.repository.integration.spec.ts`)

Tests de integración para el `RolRepository` que verifican:

- **create**: Creación de roles y manejo de restricciones únicas
- **findOne**: Búsqueda de roles por nombre
- **findAll**: Obtención de todos los roles activos
- **findAndCountAll**: Paginación y filtrado de roles por tipo
- **update**: Actualización de roles
- **remove**: Eliminación de roles

### Auth Use Cases Integration (`test/integration/auth.usecases.integration.spec.ts`)

Tests de integración para los use-cases del módulo Auth que verifican:

- **LoginUseCase**:
  - Login exitoso con credenciales válidas
  - Manejo de usuario no encontrado
  - Manejo de contraseña inválida

- **LogoutUseCase**:
  - Manejo de token de refresco faltante
  - Manejo de audit no encontrado

- **RefreshTokenUseCase**:
  - Refrescar token exitosamente
  - Manejo de token no encontrado en audit
  - Manejo de refresh token faltante en cookies

### Audit Use Cases Integration (`test/integration/audit.usecases.integration.spec.ts`)

Tests de integración para los use-cases del módulo Audit que verifican:

- **CreateAuditUseCase**:
  - Creación exitosa de registros de auditoría
  - Manejo de registros duplicados (ConflictException)

- **FindOneAuditUseCase**:
  - Búsqueda por UID
  - Búsqueda por refreshToken
  - Manejo de registro no encontrado

- **UpdateAuditUseCase**:
  - Actualización de refreshToken
  - Manejo de registro no encontrado (NotFoundException)

- **RemoveAuditUseCase**:
  - Eliminación por UID
  - Eliminación por refreshToken
  - Manejo de registro no encontrado

### Files Use Cases Unit (`test/unit/files.usecases.spec.ts`)

Tests unitarios para los use-cases del módulo Files que verifican:

- **SaveFileUseCase**:
  - Guardado exitoso de imágenes (JPEG, PNG, GIF, WebP)
  - Guardado exitoso de documentos (PDF, DOC, DOCX)
  - Validación de archivo requerido
  - Validación de tipo requerido
  - Validación de mimetype permitido
  - Manejo de errores al guardar en disco
  - Creación automática de directorios

- **DeleteFileUseCase**:
  - Eliminación exitosa de imágenes
  - Eliminación exitosa de documentos
  - Validación de nombre de archivo requerido
  - Validación de tipo requerido
  - Manejo de archivo no encontrado
  - Manejo de errores al eliminar del disco
  - Creación automática de directorios

### Health Controller Unit (`test/unit/health.controller.spec.ts`)

Tests unitarios para el controller del módulo Health que verifican:

- **Health Check Endpoint**:
  - Verificación de que el endpoint está definido
  - Llamada a health.check con array de 2 checks (database + redis)
  - Retorno de estado saludable cuando todos los servicios están up

- **Manejo de Errores**:
  - Fallo en check de Redis (value mismatch)
  - Fallo en conexión a base de datos
  - Fallo en cache set
  - Fallo en cache get

### Valid-Permission Unit (`test/unit/valid-permission.spec.ts`)

Tests unitarios para el decorator y guard de Valid-Permission que verifican:

- **ValidPermission Decorator**:
  - Verificación de que el decorator está definido
  - Retorno de función decoradora
  - Seteo de metadata con clave 'valid-permission'
  - Funcionamiento con diferentes tipos de permisos

- **PermissionsGuard**:
  - Verificación de que el guard está definido
  - Retorno de true cuando no se requiere permiso
  - Retorno de true cuando usuario tiene permiso SUPER
  - Lanzamiento de ForbiddenException cuando no tiene permiso
  - Lanzamiento de ForbiddenException cuando rol no existe
  - Lanzamiento de ForbiddenException cuando no hay permisos
  - Manejo de usuario faltante
  - Manejo de uidRol faltante
  - Verificación de permisos para ROL
  - Verificación de permisos para AUDIT
  - Permiso SUPER accede a todo
  - Llamada correcta a reflector.get
  - Llamada correcta a findOneRolUseCase

> **Nota:** Los tests reflejan el comportamiento actual de la función `validatePermission`, que tiene un bug conocido donde solo verifica el permiso SUPER correctamente.

### User Repository Unit (`test/unit/user.repository.spec.ts`)

Tests unitarios para el `UserRepository` con mocks de:

- Modelo de Sequelize
- Cache Manager
- Logger

## Datos de Prueba

Los tests utilizan datos válidos que cumplen con las validaciones del sistema:

- **UIDs**: Generados dinámicamente con `globalThis.crypto.randomUUID()`
- **Teléfonos**: Formato venezolano válido (ej: `04141000001`)
- **Contraseñas**: Hash bcrypt pre-generado
- **Roles**: UUID fijo `91a9f962-9255-4125-b5a7-539351e8c1ad` (rol super)

## Configuración de Jest

Los tests están configurados para ejecutarse en secuencia (`maxWorkers: 1`) en `jest.config.cjs` para evitar contaminación de la base de datos entre diferentes suites de tests.

## Limpieza

Cada test limpia la base de datos antes de ejecutarse (`destroy({ where: {} })`), asegurando que los tests sean independientes y reproducibles.

## Solución de Problemas

### Error de conexión a la base de datos

Verifica que:
1. El contenedor de PostgreSQL esté corriendo: `docker ps | grep postgres`
2. La base de datos `test_db` exista
3. Las credenciales en `.env.test` sean correctas

### Error de validación de UUID

Asegúrate de que todos los UIDs generados sean UUIDs válidos usando `globalThis.crypto.randomUUID()`.

### Error de teléfono inválido

Los teléfonos deben estar en formato venezolano: `04141000001` (11 dígitos, comenzando con 0).

### Tests fallan cuando se ejecutan juntos

Los tests están configurados para ejecutarse en secuencia automáticamente. Si modificas `jest.config.cjs`, asegúrate de mantener `maxWorkers: 1`.

## Estructura de Tests

### User Repository Integration (`test/integration/user.repository.integration.spec.ts`)

Tests de integración para el `UserRepository` que verifican:

- **create**: Creación de usuarios y manejo de restricciones únicas
- **findOne**: Búsqueda de usuarios por email, con inclusión de roles
- **findAll**: Obtención de todos los usuarios
- **findAndCountAll**: Paginación y filtrado de usuarios
- **update**: Actualización de usuarios
- **delete**: Eliminación de usuarios
- **transaction**: Ejecución de operaciones dentro de transacciones

### User Repository Unit (`test/unit/user.repository.spec.ts`)

Tests unitarios para el `UserRepository` con mocks de:

- Modelo de Sequelize
- Cache Manager
- Logger

## Datos de Prueba

Los tests utilizan datos válidos que cumplen con las validaciones del sistema:

- **UIDs**: Generados dinámicamente con `crypto.randomUUID()`
- **Teléfonos**: Formato venezolano válido (ej: `04141000001`)
- **Contraseñas**: Hash bcrypt pre-generado
- **Roles**: UUID fijo `91a9f962-9255-4125-b5a7-539351e8c1ad`

## Limpieza

Cada test limpia la base de datos antes de ejecutarse (`truncate: true, cascade: true`), asegurando que los tests sean independientes y reproducibles.

## Solución de Problemas

### Error de conexión a la base de datos

Verifica que:
1. El contenedor de PostgreSQL esté corriendo: `docker ps | grep postgres`
2. La base de datos `test_db` exista
3. Las credenciales en `.env.test` sean correctas

### Error de validación de UUID

Asegúrate de que todos los UIDs generados sean UUIDs válidos usando `globalThis.crypto.randomUUID()`.

### Error de teléfono inválido

Los teléfonos deben estar en formato venezolano: `04141000001` (11 dígitos, comenzando con 0).
