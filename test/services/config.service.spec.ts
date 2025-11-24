import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppConfigService } from '@/services/config.service';
import { EnvironmentVariables } from '@/config/env.config';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let mockConfigService: Partial<ConfigService<EnvironmentVariables>>;

  beforeEach(async () => {
    // Mock config service with environment values
    mockConfigService = {
      get: jest.fn((key: keyof EnvironmentVariables) => {
        const configValues: Partial<EnvironmentVariables> = {
          PORT: 3000,
          JWT_SECRET: 'test-jwt-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          EMAIL_USER: 'test@example.com',
          EMAIL_PASS: 'test-password',
          DATABASE_DIALECT: 'postgres',
          DATABASE_HOST: 'localhost',
          DATABASE_PORT: 5432,
          POSTGRES_USER: 'test_user',
          POSTGRES_PASSWORD: 'test_password',
          POSTGRES_DB: 'test_db',
          CORS: ['http://localhost:3000', 'http://localhost:8080'],
          RATE_LIMIT_TTL: 60000,
          RATE_LIMIT_LIMIT: 10,
          REDIS_URL: 'redis://localhost:6379',
        };
        return configValues[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('port', () => {
    it('debería retornar el puerto desde la configuración', () => {
      const result = service.port;
      expect(result).toBe(3000);
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
    });
  });

  describe('jwtConfig', () => {
    it('debería retornar la configuración JWT', () => {
      const result = service.jwtConfig;
      expect(result).toEqual({
        secret: 'test-jwt-secret',
        refreshSecret: 'test-refresh-secret',
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
    });
  });

  describe('emailConfig', () => {
    it('debería retornar la configuración de email', () => {
      const result = service.emailConfig;
      expect(result).toEqual({
        user: 'test@example.com',
        pass: 'test-password',
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('EMAIL_USER');
      expect(mockConfigService.get).toHaveBeenCalledWith('EMAIL_PASS');
    });
  });

  describe('databaseConfig', () => {
    it('debería retornar la configuración de base de datos', () => {
      const result = service.databaseConfig;
      expect(result).toEqual({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'test_user',
        password: 'test_password',
        database: 'test_db',
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('DATABASE_DIALECT');
      expect(mockConfigService.get).toHaveBeenCalledWith('DATABASE_HOST');
      expect(mockConfigService.get).toHaveBeenCalledWith('DATABASE_PORT');
      expect(mockConfigService.get).toHaveBeenCalledWith('POSTGRES_USER');
      expect(mockConfigService.get).toHaveBeenCalledWith('POSTGRES_PASSWORD');
      expect(mockConfigService.get).toHaveBeenCalledWith('POSTGRES_DB');
    });
  });

  describe('corsConfig', () => {
    it('debería retornar la configuración CORS', () => {
      const result = service.corsConfig;
      expect(result).toEqual(['http://localhost:3000', 'http://localhost:8080']);
      expect(mockConfigService.get).toHaveBeenCalledWith('CORS');
    });
  });

  describe('rateLimitConfig', () => {
    it('debería retornar la configuración de límite de tasa', () => {
      const result = service.rateLimitConfig;
      expect(result).toEqual({
        ttl: 60000,
        limit: 10,
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('RATE_LIMIT_TTL');
      expect(mockConfigService.get).toHaveBeenCalledWith('RATE_LIMIT_LIMIT');
    });
  });

  describe('redisConfig', () => {
    it('debería retornar la configuración de Redis', () => {
      const result = service.redisConfig;
      expect(result).toEqual({
        url: 'redis://localhost:6379',
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('REDIS_URL');
    });
  });
});