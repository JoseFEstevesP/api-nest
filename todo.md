### 1. **Mejoras de Seguridad**

Añadir capas de seguridad como CSP (Content Security Policy), protección CSRF, validación y sanitización de entradas, y cabeceras HTTP seguras. Proteger la API desde el principio es fundamental para prevenir ataques comunes (XSS, CSRF, inyecciones).

### 2. **Indexar Tablas de Base de Datos**

Analizar las consultas más frecuentes y añadir índices en las tablas correspondientes para optimizar el rendimiento de la base de datos. Es una mejora temprana que beneficia a toda la aplicación.

### 3. **Uso de Testcontainers para Pruebas del Sistema**

Configurar `testcontainers` para levantar dependencias reales (bases de datos, colas, etc.) en los tests de integración. Esto aumenta la fiabilidad de las pruebas al usar entornos idénticos a producción.

### 4. **Optimización de Rendimiento**

- Implementar caching a nivel de aplicación (ej: con Redis).
- Optimizar consultas SQL (evitar N+1, usar joins eficientes).
- Gestionar fallos de caché con estrategias como "cache-aside".
- Comprimir respuestas HTTP (gzip, brotli).  
  Estas mejoras se basan en las métricas obtenidas tras la observabilidad.
