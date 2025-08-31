
# Arquitectura de Manejo de Errores en la API

Este documento describe la estrategia centralizada y estandarizada para el manejo de errores implementada en este proyecto NestJS. El objetivo es asegurar que todos los errores, tanto los esperados como los inesperados, se gestionen de manera consistente, segura y fácil de mantener.

## Filosofía Principal

1.  **Centralización:** Un único lugar se encarga de procesar y formatear las respuestas de error.
2.  **Consistencia:** Todas las respuestas de error, sin importar su origen, tienen la misma estructura JSON.
3.  **Seguridad:** Nunca se exponen detalles sensibles de la implementación (como *stack traces*) en las respuestas de producción.
4.  **Logging Integral:** Todo error que llega al cliente es registrado para facilitar la depuración y el monitoreo.

---

## Componentes Clave

La arquitectura se basa en un componente principal que trabaja en conjunto con las características nativas de NestJS.

### 1. Filtro Global de Excepciones (`AllExceptionsFilter`)

Este es el corazón de nuestro manejo de errores. Es un filtro global registrado en `main.ts` que captura **todas** las excepciones que ocurren en la aplicación.

-   **Ubicación:** `src/filters/all-exceptions.filter.ts`
-   **Registro:** Se activa en `main.ts` con la línea:
    ```typescript
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger));
    ```

**Funcionamiento:**

1.  **Captura Universal:** Atrapa tanto las `HttpException` (errores controlados de la aplicación) como cualquier otro error inesperado (ej. `TypeError`, errores de base de datos no capturados, etc.).
2.  **Determina el Estado HTTP:**
    -   Si el error es una instancia de `HttpException`, usa el código de estado que este trae (ej. 404, 409, etc.).
    -   Para cualquier otro tipo de error, asigna por defecto un `500 Internal Server Error`.
3.  **Logging:** Utiliza el `LoggerService` para registrar los detalles completos del error, incluyendo el *stack trace*, antes de enviar la respuesta. Esto es crucial para la depuración.
4.  **Formatea la Respuesta:** Construye y envía una respuesta JSON estandarizada al cliente.

### Estructura de la Respuesta de Error

Gracias al filtro, todas las respuestas de error siguen este formato:

```json
{
  "statusCode": 409, // O 400, 404, 500, etc.
  "timestamp": "2025-08-30T20:00:00.123Z",
  "path": "/api/users",
  "message": { /* Mensaje o objeto de error específico */ }
}
```

### 2. Excepciones Estándar de NestJS (`HttpException`)

La forma correcta de señalar un error controlado en la lógica de negocio (casos de uso, servicios) es **lanzar una excepción** de `@nestjs/common`.

**Ejemplos de uso:**

```typescript
// En un caso de uso o servicio

if (!user) {
  throw new NotFoundException('El usuario especificado no fue encontrado.');
}

if (password !== user.password) {
  throw new UnauthorizedException('Credenciales incorrectas.');
}
```

Estas excepciones son las que el `AllExceptionsFilter` espera para generar respuestas de error con códigos 4xx.

### 3. Lógica de Validación de Negocio

Las funciones de validación personalizadas (como `validatePropertyData`) fueron refactorizadas para alinearse con esta arquitectura.

-   **Antes:** Devolvían un objeto de error que el caso de uso debía comprobar.
-   **Ahora:** Lanzan directamente una `ConflictException` (o similar) si la validación falla. Esto simplifica enormemente el código en los casos de uso, eliminando la necesidad de bloques `if (errors) { ... }`.

---

## Flujo de un Error (Ciclo de Vida)

1.  **Ocurrencia:** Se produce un error.
    -   *Ejemplo A (Controlado):* Un caso de uso lanza `new ConflictException('El email ya está en uso.')`.
    -   *Ejemplo B (No Controlado):* Una variable es `null` y se intenta acceder a una de sus propiedades, lanzando un `TypeError`.
2.  **Propagación:** La excepción sube por la pila de llamadas de la aplicación.
3.  **Intercepción:** El `AllExceptionsFilter`, al estar registrado globalmente, intercepta la excepción antes de que NestJS la maneje por defecto.
4.  **Procesamiento en el Filtro:**
    -   Identifica el tipo de excepción y el código de estado apropiado.
    -   Registra el error con todos sus detalles (`logger.error(...)`).
    -   Construye el cuerpo de la respuesta JSON estandarizada.
5.  **Respuesta al Cliente:** El filtro envía la respuesta JSON al cliente que realizó la petición.

Este flujo garantiza que la aplicación sea robusta y que la experiencia para el desarrollador del frontend sea predecible, mientras que el equipo de backend obtiene toda la información necesaria para resolver los problemas.
