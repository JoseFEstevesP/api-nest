# Módulo de Archivos

## Descripción

El módulo de archivos maneja la subida y eliminación de archivos de forma segura.

## Endpoints

| Método | Endpoint            | Descripción      | Auth |
| ------ | ------------------- | ---------------- | ---- |
| POST   | `/api/files/upload` | Subir archivo    | ✅   |
| DELETE | `/api/files/delete` | Eliminar archivo | ✅   |

## Uso

### Subir Archivo

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/ruta/al/archivo.pdf"
```

**Respuesta:**

```json
{
	"url": "/uploads/uuid-archivo.pdf",
	"filename": "uuid-archivo.pdf",
	"originalName": "documento.pdf",
	"mimetype": "application/pdf",
	"size": 1024000
}
```

### Eliminar Archivo

```bash
curl -X DELETE http://localhost:3000/api/files/delete \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "uuid-archivo.pdf"
  }'
```

## Configuración

### Tipos Permitidos

- Imágenes: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Documentos: `application/pdf`, `text/plain`
- Otros: según configuración

### Límites

- Tamaño máximo: 10MB (configurable)
- Almacenamiento: `uploads/`

## Use Cases

- `SaveFileUseCase` - Guardar archivo
- `DeleteFileUseCase` - Eliminar archivo

## Validaciones

- Verificar tipo MIME
- Verificar tamaño
- Sanitizar nombre de archivo

## Seguridad

- Archivos almacenados en directorio privado
- Nombre aleatorio (UUID) para evitar conflictos
- Validación de tipos antes de guardar
