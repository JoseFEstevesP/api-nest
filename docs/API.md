# Documentación de la API

## Información General

- **URL Base**: `http://localhost:3000/api`
- **Documentación Swagger**: `http://localhost:3000/doc`
- **Formato de Respuesta**: JSON
- **Autenticación**: JWT Bearer Token

## Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {},
  "message": "Operación exitosa"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": {}
  }
}
```

## Autenticación

### POST /auth/login
**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "uuid-del-usuario",
      "email": "usuario@ejemplo.com",
      "name": "Nombre Usuario",
      "rol": {
        "name": "admin",
        "permissions": ["CREATE_USER", "READ_USER"]
      }
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

### POST /auth/logout
**Headers:** `Authorization: Bearer <access-token>`

### POST /auth/refresh-token
**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

## Gestión de Usuarios

### POST /user (Registro público)
```json
{
  "name": "Nombre Usuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### GET /user (Lista paginada - Admin)
**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Término de búsqueda
- `orderBy`: Campo para ordenar
- `order`: ASC/DESC

### GET /user/profile (Perfil del usuario autenticado)
**Headers:** `Authorization: Bearer <access-token>`

### PATCH /user/profile/data
```json
{
  "name": "Nuevo Nombre"
}
```

### PATCH /user/profile/email
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña-actual"
}
```

### POST /user/recoveryPassword
```json
{
  "email": "usuario@ejemplo.com"
}
```

## Gestión de Roles

### POST /rol (Crear rol - Admin)
```json
{
  "name": "editor",
  "description": "Editor de contenido",
  "permissions": ["READ_USER", "UPDATE_USER"]
}
```

### GET /rol/per (Permisos del usuario actual)
```json
{
  "success": true,
  "data": {
    "permissions": ["CREATE_USER", "READ_USER"]
  }
}
```

## Gestión de Archivos

### POST /files/upload
**Content-Type:** `multipart/form-data`
- `file`: Archivo a subir
- `type`: "image" o "document"

### DELETE /files/delete
```json
{
  "filename": "archivo-123456.jpg",
  "type": "image"
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `UNAUTHORIZED` | Token inválido |
| `FORBIDDEN` | Sin permisos |
| `VALIDATION_ERROR` | Datos inválidos |
| `USER_NOT_FOUND` | Usuario no encontrado |
| `EMAIL_ALREADY_EXISTS` | Email ya registrado |

## Límites

- **Rate Limiting**: 100 requests/minuto
- **Archivo máximo**: 10MB
- **Tipos permitidos**: jpg, png, pdf, doc, txt