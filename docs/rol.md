# Módulo de Roles

## Descripción

El módulo de roles gestiona los roles y permisos de usuarios para el control de acceso basado en roles (RBAC).

## Endpoints

| Método | Endpoint               | Descripción          | Auth | Permisos |
| ------ | ---------------------- | -------------------- | ---- | -------- |
| POST   | `/api/rol`             | Crear rol            | ✅   | Admin    |
| GET    | `/api/rol`             | Listar roles         | ✅   | Admin    |
| GET    | `/api/rol/per`         | Permisos del usuario | ✅   | User     |
| GET    | `/api/rol/:uid`        | Obtener rol por ID   | ✅   | Admin    |
| PATCH  | `/api/rol`             | Actualizar rol       | ✅   | Admin    |
| DELETE | `/api/rol/delete/:uid` | Eliminar rol         | ✅   | Admin    |

## Uso

### Listar Roles

```bash
curl -X GET http://localhost:3000/api/rol \
  -H "Authorization: Bearer <access_token>"
```

**Respuesta:**

```json
[
	{ "value": "uuid-rol-1", "label": "admin" },
	{ "value": "uuid-rol-2", "label": "user" }
]
```

### Obtener Permisos del Usuario

```bash
curl -X GET http://localhost:3000/api/rol/per \
  -H "Authorization: Bearer <access_token>"
```

## Roles Disponibles

### Admin

- Acceso completo a todos los endpoints
- Gestión de usuarios
- Gestión de roles

### User

- Acceso a su propio perfil
- Actualización de datos propios

## Permisos

Los permisos se definen en `src/modules/security/rol/enum/permissions.ts`:

```typescript
export enum Permission {
	userCreate = 'user:create',
	userRead = 'user:read',
	userUpdate = 'user:update',
	userDelete = 'user:delete',
	rolCreate = 'rol:create',
	rolRead = 'rol:read',
	rolUpdate = 'rol:update',
	rolDelete = 'rol:delete',
	auditRead = 'audit:read',
	super = 'super', // Acceso total
}
```

## Use Cases

- `CreateRolUseCase` - Crear nuevo rol
- `FindAllRolsUseCase` - Listar todos los roles
- `FindAllRolsPaginationUseCase` - Listar con paginación
- `FindOneRolUseCase` - Buscar rol por ID
- `FindRolPermissionsUseCase` - Obtener permisos del usuario
- `UpdateRolUseCase` - Actualizar rol
- `RemoveRolUseCase` - Eliminar rol

## Caché

Los roles se almacenan en caché Redis:

- TTL: 1 hora (3600000 ms)
- Clave: `cache:role:all` para lista
- Clave: `cache:role:{uid}` para rol individual

## Logging

```typescript
// Listar roles
this.logger.info('Roles encontrados', {
	type: 'role_find_all',
	count: roles.length,
});
this.logger.logMetric('rol.buscar_todos', roles.length);

// Buscar rol
this.logger.debug('Retornando rol desde caché', {
	type: 'role_find_one',
	fromCache: true,
});
```

## Índices

Los roles tienen los siguientes índices en la base de datos:

- `idx_rol_typeRol_status` - Búsqueda por tipo y estado
