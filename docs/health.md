# Módulo de Health Checks

## Descripción

El módulo de health checks proporciona endpoints para verificar el estado de la aplicación e infraestructura.

## Endpoints

| Método | Endpoint            | Descripción           |
| ------ | ------------------- | --------------------- |
| GET    | `/api/health`       | Estado general        |
| GET    | `/api/health/ready` | Estado de preparación |
| GET    | `/api/health/live`  | Estado de vida        |

## Uso

### Health General

```bash
curl http://localhost:3000/api/health
```

**Respuesta:**

```json
{
	"status": "ok",
	"details": {
		"database": {
			"status": "up",
			"responseTime": 15
		},
		"redis": {
			"status": "up",
			"responseTime": 5
		},
		"heap_used": {
			"status": "up",
			"used": "150MB",
			"limit": "300MB"
		},
		"system": {
			"status": "up",
			"cpu": 0.45,
			"memory": 65.2
		}
	},
	"timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Health Indicators

### DatabaseHealthIndicator

- Verifica conexión a PostgreSQL
- Mide tiempo de respuesta

### RedisHealthIndicator

- Verifica conexión a Redis
- Mide tiempo de respuesta

### MemoryHealthIndicator

- Monitorea uso de heap
- Alerta si > 90% del límite

### SystemHealthIndicator

- Uso de CPU
- Uso de memoria del sistema

## Configuración

Los health checks están configurados en `src/modules/health/`.

## Uso en Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```
