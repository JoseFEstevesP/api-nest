# Módulo de Autenticación

## Descripción

El módulo de autenticación maneja todo lo relacionado con el inicio de sesión, cierre de sesión y renovación de tokens JWT.

## Endpoints

| Método | Endpoint                    | Descripción      | Auth |
| ------ | --------------------------- | ---------------- | ---- |
| POST   | `/api/auth/login`           | Iniciar sesión   | ❌   |
| POST   | `/api/auth/logout`          | Cerrar sesión    | ✅   |
| POST   | `/api/auth/refresh-token`   | Renovar token    | ❌   |
| GET    | `/api/auth/google`          | Login con Google | ❌   |
| GET    | `/api/auth/google/callback` | Callback Google  | ❌   |

## Uso

### Iniciar Sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'
```

**Respuesta exitosa (201):**

```json
{
	"msg": "Inicio de sesión exitoso"
}
```

Los tokens se almacenan en cookies HTTP-only:

- `accessToken` - Expira en 1 hora
- `refreshToken` - Expira en 7 días

### Cerrar Sesión

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

### Renovar Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Cookie: refreshToken=<refresh_token>"
```

## Use Cases

- `LoginUseCase` - Autenticación de usuarios
- `LogoutUseCase` - Cierre de sesión
- `RefreshTokenUseCase` - Renovación de tokens
- `GoogleLoginUseCase` - Autenticación con Google OAuth
- `ValidateGoogleUserUseCase` - Validación de usuarios Google

## Seguridad

### Rate Limiting

- **@ThrottleAuth()** - 5 peticiones cada 15 minutos
- Aplicado a: login, refresh-token

### Logging

```typescript
// Login exitoso
this.logger.info('Usuario inició sesión', { type: 'auth_login', userId: uid });

// Login fallido
this.logger.warn('Login fallido - contraseña inválida', {
	type: 'auth_login',
	status: 'failed',
});

// Métricas
this.logger.logMetric('auth.login.exitoso', 1);
this.logger.logMetric('auth.logout.exitoso', 1);
```

## Permisos

No requiere permisos especiales para los endpoints públicos.
Los endpoints protegidos requieren Bearer Token JWT.
