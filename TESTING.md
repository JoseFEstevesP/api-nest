# Guía de Testing

## Configuración

El proyecto utiliza **Vitest** como framework de testing con configuraciones separadas para tests unitarios y E2E.

### Archivos de Configuración

- `vitest.config.ts` - Configuración general
- `vitest.unit.config.ts` - Tests unitarios
- `vitest.e2e.config.ts` - Tests E2E

## Scripts Disponibles

### Tests Unitarios
```bash
# Ejecutar tests unitarios en modo watch
pnpm test:unit

# Ejecutar tests unitarios una vez
pnpm test:unit:run

# Ejecutar tests unitarios con interfaz web
pnpm test:unit:ui

# Ejecutar tests con cobertura
pnpm test:cov

# Ejecutar tests con cobertura e interfaz web
pnpm test:cov:ui
```

### Tests E2E
```bash
# Ejecutar tests E2E en modo watch
pnpm test:e2e

# Ejecutar tests E2E una vez
pnpm test:e2e:run
```

### Tests Generales
```bash
# Ejecutar todos los tests
pnpm test:all

# Ejecutar tests en modo watch
pnpm test:watch

# Debug de tests
pnpm test:debug
```

## Estructura de Archivos

```
src/
├── test/
│   ├── setup.ts              # Setup global para tests unitarios
│   ├── mocks/
│   │   └── database.mock.ts   # Mocks de base de datos
│   └── utils/
│       └── test-helpers.ts    # Utilidades de testing
├── **/*.spec.ts               # Tests unitarios
test/
├── e2e-setup.ts              # Setup para tests E2E
├── **/*.e2e-spec.ts          # Tests E2E
```

## Mocks Disponibles

### Base de Datos
- `createMockRepository()` - Mock genérico de repositorio Sequelize
- `mockSequelize` - Mock de instancia Sequelize
- `mockTransaction` - Mock de transacciones

### Servicios
- `mockConfigService` - Mock de ConfigService
- `mockJwtService` - Mock de JwtService
- `mockCacheManager` - Mock de Cache Manager
- `mockLoggerService` - Mock de Logger

### Utilidades
- `createMockRequest()` - Mock de request HTTP
- `createMockResponse()` - Mock de response HTTP
- `createTestingModule()` - Helper para crear módulos de testing

## Ejemplos de Uso

### Test Unitario Básico
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MyService } from './my.service';
import { createMockRepository } from '@/test/mocks/database.mock';

describe('MyService', () => {
  let service: MyService;
  let repository: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repository = createMockRepository();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: getModelToken(MyEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });
});
```

### Test E2E Básico
```typescript
import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import * as request from 'supertest';

describe('MyController (e2e)', () => {
  it('/my-endpoint (GET)', async () => {
    const response = await request(global.app.getHttpServer())
      .get('/my-endpoint')
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('data');
  });
});
```

## Cobertura de Código

La configuración incluye umbrales mínimos de cobertura:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Los reportes se generan en formato:
- **Text**: Consola
- **LCOV**: Para herramientas externas
- **HTML**: Interfaz web interactiva

## Mejores Prácticas

1. **Usar mocks apropiados** para dependencias externas
2. **Limpiar mocks** después de cada test con `vi.clearAllMocks()`
3. **Agrupar tests relacionados** con `describe`
4. **Usar nombres descriptivos** para los tests
5. **Probar casos de éxito y error**
6. **Mantener tests independientes** entre sí
7. **Usar setup/teardown** apropiados con `beforeEach`/`afterEach`

## Variables de Entorno para Tests

Las siguientes variables se configuran automáticamente en el setup:
- `NODE_ENV=test`
- `JWT_SECRET=test-secret`
- `DATABASE_*` - Configuración de base de datos de prueba
- `REDIS_URL` - URL de Redis para tests

## Debugging

Para debuggear tests:
```bash
pnpm test:debug
```

Esto iniciará Vitest con el inspector de Node.js habilitado.