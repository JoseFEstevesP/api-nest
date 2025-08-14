# API Nest

Este proyecto es una API robusta y escalable construida con NestJS, diseñada para proporcionar un backend seguro y eficiente para diversas aplicaciones. Cuenta con gestión completa de usuarios y roles, autenticación, registro de auditoría y manejo de archivos.

## Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Configuración](#configuración)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación](#instalación)
  - [Variables de Entorno](#variables-de-entorno)
  - [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
  - [Modo Desarrollo](#modo-desarrollo)
  - [Compilación para Producción](#compilación-para-producción)
- [Endpoints de la API](#endpoints-de-la-api)
  - [Autenticación (`/auth`)](#autenticación-auth)
  - [Gestión de Usuarios (`/user`)](#gestión-de-usuarios-user)
  - [Gestión de Roles (`/rol`)](#gestión-de-roles-rol)
  - [Registros de Auditoría (`/audit`)](#registros-de-auditoría-audit)
  - [Gestión de Archivos (`/files`)](#gestión-de-archivos-files)
- [Pruebas](#pruebas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Notas Arquitectónicas (Patrón de Casos de Uso)](#notas-arquitectónicas-patrón-de-casos-de-uso)

## Descripción del Proyecto

Este proyecto sirve como API backend, ofreciendo una base segura y modular para aplicaciones que requieren autenticación de usuarios, autorización y gestión de datos. Está construido con enfoque en mantenibilidad, escalabilidad y clara separación de responsabilidades.

## Características

- **Gestión de Usuarios**: Crear, leer, actualizar y eliminar cuentas de usuario. Incluye activación de usuarios, recuperación de contraseñas y actualización de perfiles.
- **Control de Acceso Basado en Roles (RBAC)**: Definir roles con permisos específicos para controlar el acceso a recursos de la API.
- **Autenticación y Autorización**: Protección de endpoints usando JWT (JSON Web Tokens) para autenticación y guards para autorización. Incluye login, logout y mecanismos de refresh token.
- **Registro de Auditoría**: Registro automático de acciones de usuarios y eventos del sistema para seguridad y cumplimiento.
- **Gestión de Archivos**: Subida y eliminación segura de archivos (imágenes, documentos) con almacenamiento organizado.
- **Limitación de Tasa de Solicitudes**: Protege la API contra abuso y ataques de fuerza bruta.
- **Caché**: Mejora el rendimiento almacenando en caché datos accedidos frecuentemente.
- **Tareas Programadas**: Tareas automatizadas para mantenimiento del sistema (ej. limpieza de registros de auditoría antiguos).

## Tecnologías Utilizadas

- **Framework Backend**: [NestJS](https://nestjs.com/) (Node.js)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Sequelize](https://sequelize.org/)
- **Autenticación**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Caché**: [Redis](https://redis.io/) (vía `@nestjs/cache-manager` y `keyv-redis`)
- **Validación**: [Class-validator](https://github.com/typestack/class-validator)
- **Documentación API**: [Swagger (OpenAPI)](https://swagger.io/)
- **Contenedores**: [Docker](https://www.docker.com/)
- **Gestor de Paquetes**: [pnpm](https://pnpm.io/)

## Configuración

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/en/download/) (versión LTS recomendada)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/get-docker/) (para ejecutar PostgreSQL y Redis vía Docker Compose)

### Instalación

1. **Clonar el repositorio:**

```bash
git clone <url_del_repositorio>
cd api-nest
```

2. **Instalar dependencias:**

```bash
pnpm install
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`.

```
PORT=3000
JWT_SECRET=# llave para el JWT
JWT_REFRESH_SECRET=# llave para el JWT de refresco

EMAIL_USER=# correo para envíos del sistema
EMAIL_PASS=# contraseña del correo

NODE_ENV= # 'development' # 'production'
DEFAULT_ROL_FROM_USER=# rol por defecto para usuarios
# múltiples CORS se separan por comas
# CORS=http://localhost:5173,http://localhost:4173
CORS=http://localhost:5173

DATABASE_DIALECT=postgres
DATABASE_HOST='localhost'
DATABASE_PORT=5432
POSTGRES_USER='postgres'
POSTGRES_PASSWORD=# contraseña de la base de datos
POSTGRES_DB=# nombre de la base de datos

RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100

REDIS_POST=6379
REDIS_URL="redis://localhost:6379"
```

**Importante:** Reemplaza los valores de ejemplo con tu configuración real. Para `JWT_SECRET` y `JWT_REFRESH_SECRET`, usa cadenas fuertes generadas aleatoriamente.

### Configuración de la Base de Datos

Este proyecto usa Docker Compose para configurar PostgreSQL y Redis.

1. **Iniciar servicios de Docker Compose:**

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en el puerto `5432` y Redis en el puerto `6379`.

2. **Ejecutar migraciones:**
   Una vez que los contenedores estén en funcionamiento, aplica las migraciones para crear las tablas necesarias:

```bash
pnpm run migrate
```

## Ejecución de la Aplicación

### Modo Desarrollo

Para ejecutar la aplicación en modo desarrollo con recarga en caliente (incluye migraciones):

```bash
pnpm run dev
```

La API estará accesible en `http://localhost:3000/api` (o el puerto configurado en tus variables de entorno).
La documentación Swagger estará disponible en `http://localhost:3000/doc`.

### Compilación para Producción

Para compilar la aplicación para producción:

```bash
pnpm run build
```

Para ejecutar la aplicación compilada:

```bash
pnpm run start:prod
```

## Endpoints de la API

La documentación Swagger está disponible en `/doc` cuando la aplicación está en ejecución. Aquí un resumen de los principales grupos de endpoints.

### Autenticación (`/auth`)

- `POST /auth/login`: Autentica un usuario y recibe tokens de acceso y refresco.
- `POST /auth/logout`: Invalida la sesión del usuario y limpia los tokens.
- `POST /auth/refresh-token`: Obtén un nuevo token de acceso usando un token de refresco.

### Gestión de Usuarios (`/user`)

- `POST /user`: Registra un nuevo usuario por defecto.
- `POST /user/protect`: Registra un nuevo usuario (solo admin).
- `GET /user`: Obtiene lista paginada de usuarios (solo admin).
- `PATCH /user`: Actualiza detalles de usuario (solo admin).
- `GET /user/profile`: Obtiene el perfil del usuario autenticado.
- `PATCH /user/profile/data`: Actualiza datos del perfil del usuario autenticado.
- `PATCH /user/profile/email`: Actualiza email del usuario autenticado.
- `PATCH /user/profile/password`: Actualiza contraseña del usuario autenticado.
- `DELETE /user/profile/unregister`: Desactiva la cuenta del usuario autenticado.
- `DELETE /user/delete/:uid`: Elimina un usuario por UID (solo admin).
- `POST /user/recoveryPassword`: Inicia recuperación de contraseña.
- `POST /user/recoveryPassCode`: Verifica código de recuperación.
- `POST /user/newPassword`: Establece nueva contraseña después de recuperación.
- `PATCH /user/updatePassword`: Actualiza contraseña de usuario (solo admin).
- `POST /user/activated`: Activa cuenta de usuario usando un código.

### Gestión de Roles (`/rol`)

- `POST /rol`: Crea un nuevo rol.
- `GET /rol/one/:uid`: Obtiene un rol por UID.
- `GET /rol/per`: Obtiene permisos del rol del usuario autenticado.
- `GET /rol`: Obtiene lista paginada de roles.
- `GET /rol/all`: Obtiene lista simplificada de todos los roles.
- `PATCH /rol`: Actualiza detalles de un rol.
- `DELETE /rol/delete/:uid`: Elimina un rol por UID.

### Registros de Auditoría (`/audit`)

- `GET /audit`: Obtiene lista paginada de registros de auditoría.
- `DELETE /audit/delete/:uid`: Elimina un registro de auditoría por UID.

### Gestión de Archivos (`/files`)

- `POST /files/upload`: Sube un archivo (imagen o documento).
- `DELETE /files/delete`: Elimina un archivo por nombre y tipo.

## Pruebas

Para ejecutar todas las pruebas (unitarias y e2e):

```bash
pnpm run test:unit && pnpm run test:e2e
```

Para ejecutar solo pruebas unitarias:

```bash
pnpm run test:unit
```

Para ejecutar solo pruebas end-to-end:

```bash
pnpm run test:e2e
```

## Estructura del Proyecto

La lógica principal reside en el directorio `src`, organizado en módulos:

```
src/
├───app.module.ts         # Módulo principal
├───main.ts               # Punto de entrada
├───config/               # Configuración de entorno
├───constants/            # Constantes globales
├───correlation-id/       # Middleware para IDs de correlación
├───dto/                  # Objetos de Transferencia de Datos
├───functions/            # Funciones utilitarias
├───middlewares/          # Middlewares globales
├───migrations/           # Migraciones de base de datos
├───modules/
│   ├───files/            # Gestión de archivos
│   └───security/         # Módulos de seguridad
│       ├───audit/        # Auditoría
│       ├───auth/         # Autenticación/autorización
│       ├───rol/          # Gestión de roles
│       ├───user/         # Gestión de usuarios
│       └───valid-permission/ # Guard de permisos
└───services/             # Servicios globales (email, logger)
```

Cada módulo (`user`, `rol`, `auth`, `audit`, `files`) sigue una estructura consistente que incluye:

- `*.controller.ts`: Maneja peticiones HTTP.
- `*.module.ts`: Definición del módulo NestJS.
- `use-case/`: Casos de uso que encapsulan operaciones de negocio.
- `dto/`: Objetos para validación de request/response.
- `entities/`: Modelos de Sequelize.
- `repository/`: Lógica de interacción con la base de datos.

## Notas Arquitectónicas (Patrón de Casos de Uso)

Este proyecto usa el patrón "Casos de Uso", alejándose de servicios monolíticos. Este enfoque promueve:

- **Principio de Responsabilidad Única**: Cada caso de uso maneja una sola operación.
- **Mejor Legibilidad**: Lógica de negocio claramente definida y aislada.
- **Pruebas más Fáciles**: Casos de uso pueden probarse aisladamente.
- **Mejor Mantenibilidad**: Cambios afectan menos componentes.
- **Dependencias más Claras**: Dependencias explícitas y granulares.

Los controladores ahora delegan directamente a los casos de uso apropiados, haciéndolos más delgados y enfocados solo en manejar preocupaciones HTTP.
