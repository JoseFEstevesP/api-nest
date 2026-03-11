# Módulo de Usuarios

## Descripción

El módulo de usuarios gestiona el registro, actualización, eliminación y recuperación de contraseñas de usuarios.

## Endpoints

| Método | Endpoint                       | Descripción          | Auth | Permisos |
| ------ | ------------------------------ | -------------------- | ---- | -------- |
| POST   | `/api/user`                    | Registro público     | ❌   | -        |
| POST   | `/api/user/protect`            | Crear usuario        | ✅   | Admin    |
| GET    | `/api/user`                    | Listar usuarios      | ✅   | Admin    |
| GET    | `/api/user/profile`            | Perfil actual        | ✅   | User     |
| PATCH  | `/api/user/profile/data`       | Actualizar perfil    | ✅   | User     |
| PATCH  | `/api/user/profile/email`      | Cambiar email        | ✅   | User     |
| PATCH  | `/api/user/profile/password`   | Cambiar contraseña   | ✅   | User     |
| DELETE | `/api/user/profile/unregister` | Desactivar cuenta    | ✅   | User     |
| POST   | `/api/user/recoveryPassword`   | Recuperar contraseña | ❌   | -        |
| POST   | `/api/user/activated`          | Activar cuenta       | ❌   | -        |

## Uso

### Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{
    "names": "Juan",
    "surnames": "Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+1234567890",
    "ci": "12345678",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Obtener Perfil

```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer <access_token>"
```

### Actualizar Perfil

```bash
curl -X PATCH http://localhost:3000/api/user/profile/data \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "names": "Juan Actualizado"
  }'
```

## Use Cases

- `CreateUserUseCase` - Registro de usuarios
- `CreateProtectUserUseCase` - Crear usuario desde admin
- `FindAllUsersUseCase` - Listar usuarios con paginación
- `FindOneUserUseCase` - Buscar usuario por ID
- `FindUserByEmailUseCase` - Buscar por email
- `FindUserByIdUseCase` - Buscar para autenticación
- `GetUserProfileUseCase` - Obtener perfil actual
- `UpdateUserUseCase` - Actualizar usuario (admin)
- `UpdateUserProfileUseCase` - Actualizar perfil propio
- `UpdateUserProfileEmailUseCase` - Cambiar email
- `UpdateUserProfilePasswordUseCase` - Cambiar contraseña
- `RemoveUserUseCase` - Eliminar usuario (soft delete)
- `UnregisterUserUseCase` - Desactivar cuenta propia
- `ActivateAccountUseCase` - Activar cuenta con código
- `RecoveryPasswordUseCase` - Iniciar recuperación
- `RecoveryVerifyPasswordUseCase` - Verificar código
- `SetNewPasswordUseCase` - Establecer nueva contraseña
- `ValidateAttemptUseCase` - Validar intentos de login

## Caché

El listado de usuarios utiliza paginación con límites:

- Máximo 100 registros por página
- Página mínima: 1

## Logging

```typescript
// Crear usuario
this.logger.info('Usuario creado exitosamente', {
	type: 'create_user',
	userId: uid,
});
this.logger.logMetric('usuario.creado', 1);

// Actualizar usuario
this.logger.info('Usuario actualizado', { type: 'user_update', userId: uid });
this.logger.logMetric('usuario.actualizado', 1);

// Eliminar usuario
this.logger.logMetric('usuario.eliminado', 1);
```

## Validaciones

- Email válido y único
- Teléfono único
- CI único
- Contraseña mínima 8 caracteres
- Nombres y apellidos entre 3-255 caracteres
