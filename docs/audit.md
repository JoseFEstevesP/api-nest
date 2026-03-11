# Módulo de Auditoría

## Descripción

El módulo de auditoría registra todas las acciones importantes de los usuarios para compliance y seguridad.

## Endpoints

| Método | Endpoint                 | Descripción        | Auth | Permisos |
| ------ | ------------------------ | ------------------ | ---- | -------- |
| GET    | `/api/audit`             | Listar auditoría   | ✅   | Admin    |
| GET    | `/api/audit/:uid`        | Obtener auditoría  | ✅   | Admin    |
| DELETE | `/api/audit/delete/:uid` | Eliminar auditoría | ✅   | Admin    |

## Uso

### Listar Auditoría

```bash
curl -X GET http://localhost:3000/api/audit?page=1&limit=30 \
  -H "Authorization: Bearer <access_token>"
```

**Respuesta:**

```json
{
  "rows": [
    {
      "uid": "uuid-audit",
      "uidUser": "uuid-user",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "userPlatform": "Windows",
      "dataToken": {...},
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 100,
  "currentPage": 1,
  "nextPage": 2,
  "previousPage": null,
  "limit": 30,
  "pages": 4
}
```

## Datos Registrados

Cada entrada de auditoría incluye:

- **uidUser** - ID del usuario
- **ip** - Dirección IP del cliente
- **userAgent** - User agent del navegador
- **userPlatform** - Plataforma (Windows, Mac, Linux, etc.)
- **dataToken** - Datos del token JWT
- **refreshToken** - Token de refresh
- **createdAt** - Fecha de creación

## Use Cases

- `CreateAuditUseCase` - Crear registro de auditoría
- `FindAllAuditsUseCase` - Listar auditoría con paginación
- `FindOneAuditUseCase` - Buscar auditoría por ID
- `UpdateAuditUseCase` - Actualizar auditoría
- `RemoveAuditUseCase` - Eliminar auditoría
- `CleanUpOldAuditsUseCase` - Limpiar auditoría antigua

## Logging

```typescript
// Crear auditoría
this.logger.debug('Creando registro de auditoría', { type: 'audit_create' });
this.logger.info('Auditoría creada', { type: 'audit_create', auditId });

// Listar auditoría
this.logger.info('Auditorías encontradas', {
	type: 'audit_find_all',
	total: 100,
});
this.logger.logMetric('auditoria.buscar_todos', 100);
```

## Índices

La tabla de auditoría tiene índices compuestos:

- `idx_audit_user_created` - Búsqueda por usuario y fecha

## Retención

Los logs de auditoría antiguos pueden limpiarse con:

```bash
# Limpiar auditorías mayores a 90 días
```
