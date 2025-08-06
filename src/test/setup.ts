import 'reflect-metadata';
import { vi } from 'vitest';

// Mock de Sequelize ANTES de cualquier import
vi.mock('sequelize-typescript', () => ({
	Sequelize: vi.fn().mockImplementation(() => ({
		authenticate: vi.fn().mockResolvedValue(undefined),
		close: vi.fn().mockResolvedValue(undefined),
		sync: vi.fn().mockResolvedValue(undefined),
		addModels: vi.fn(),
		defineModels: vi.fn(),
	})),
	Model: class MockModel {
		static init() {
			return this;
		}
		static associate() {}
	},
	Table: () => (_target: any) => {},
	Column: () => (_target: any, _key: string) => {},
	PrimaryKey: () => (_target: any, _key: string) => {},
	AutoIncrement: () => (_target: any, _key: string) => {},
	CreatedAt: () => (_target: any, _key: string) => {},
	UpdatedAt: () => (_target: any, _key: string) => {},
	ForeignKey: () => (_target: any, _key: string) => {},
	BelongsTo: () => (_target: any, _key: string) => {},
	HasMany: () => (_target: any, _key: string) => {},
	DataType: {
		UUID: 'uuid',
		STRING: 'string',
		BOOLEAN: 'boolean',
		ENUM: (...values: any[]) => `enum(${values.join(',')})`,
		ARRAY: (type: any) => `array(${type})`,
		TEXT: 'text',
	},
}));

// Mock del módulo @nestjs/sequelize
vi.mock('@nestjs/sequelize', () => ({
	SequelizeModule: {
		forRoot: vi.fn().mockReturnValue({
			module: class MockSequelizeModule {},
			providers: [],
			exports: [],
		}),
		forRootAsync: vi.fn().mockReturnValue({
			module: class MockSequelizeModule {},
			providers: [],
			exports: [],
		}),
		forFeature: vi.fn().mockReturnValue({
			module: class MockSequelizeFeatureModule {},
			providers: [],
			exports: [],
		}),
	},
	InjectModel: () => vi.fn(),
	getModelToken: (model: any) => `${model.name}Model`,
}));

// Mock global de console para tests más limpios
global.console = {
	...console,
	log: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// Mock de Redis
vi.mock('@keyv/redis', () => ({
	default: vi.fn().mockImplementation(() => ({
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		clear: vi.fn(),
	})),
}));

// Mock de nodemailer
vi.mock('nodemailer', () => ({
	createTransporter: vi.fn().mockReturnValue({
		sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
	}),
}));

// Mock de bcrypt
vi.mock('bcrypt', () => ({
	hash: vi.fn().mockResolvedValue('hashed-password'),
	compare: vi.fn().mockResolvedValue(true),
}));

// Mock de JWT
vi.mock('@nestjs/jwt', () => ({
	JwtService: vi.fn().mockImplementation(() => ({
		sign: vi.fn().mockReturnValue('test-token'),
		verify: vi.fn().mockReturnValue({ sub: 1, email: 'test@test.com' }),
	})),
	JwtModule: {
		register: vi.fn().mockReturnValue({
			module: class MockJwtModule {},
			providers: [],
			exports: [],
		}),
		registerAsync: vi.fn().mockReturnValue({
			module: class MockJwtModule {},
			providers: [],
			exports: [],
		}),
	},
}));

// Mock de @nestjs/config
vi.mock('@nestjs/config', () => ({
	ConfigModule: {
		forRoot: vi.fn().mockReturnValue({
			module: class MockConfigModule {},
			providers: [],
			exports: [],
		}),
	},
	ConfigService: vi.fn().mockImplementation(() => ({
		get: vi.fn((key: string) => process.env[key] || 'mock-value'),
	})),
}));

// Mock de @nestjs/serve-static
vi.mock('@nestjs/serve-static', () => ({
	ServeStaticModule: {
		forRoot: vi.fn().mockReturnValue({
			module: class MockServeStaticModule {},
			providers: [],
			exports: [],
		}),
	},
}));

// env
process.env.PORT = '3000';
process.env.JWT_SECRET =
	'JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(';
process.env.JWT_REFRESH_SECRET =
	'JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJosèEstevesJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(JUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(Bdhy3fl<"($f.8r-]#.eJUC#,m-j(';
process.env.EMAIL_USER = 'test@gmail.com';
process.env.EMAIL_PASS = 'dddddddddddddddddddd';
process.env.NODE_ENV = 'development';
process.env.DEFAULT_ROL_FROM_USER = 'user';
process.env.CORS = 'http://localhost:5173';
process.env.DATABASE_DIALECT = 'postgres';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.POSTGRES_USER = 'postgres';
process.env.POSTGRES_PASSWORD = 'pg';
process.env.POSTGRES_DB = 'pg';
process.env.RATE_LIMIT_TTL = '60000';
process.env.RATE_LIMIT_LIMIT = '100';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_PORT = '6379';

// Mock de cache-manager
vi.mock('cache-manager', () => ({
	caching: vi.fn().mockResolvedValue({
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
		reset: vi.fn(),
	}),
}));

// Mock de @nestjs/cache-manager
vi.mock('@nestjs/cache-manager', () => ({
	CacheModule: {
		register: vi.fn().mockReturnValue({
			module: class MockCacheModule {},
			providers: [],
			exports: [],
		}),
		registerAsync: vi.fn().mockReturnValue({
			module: class MockCacheModule {},
			providers: [],
			exports: [],
		}),
	},
	CACHE_MANAGER: 'CACHE_MANAGER',
}));

// Mock de @nestjs/throttler
vi.mock('@nestjs/throttler', () => ({
	ThrottlerModule: {
		forRoot: vi.fn().mockReturnValue({
			module: class MockThrottlerModule {},
			providers: [],
			exports: [],
		}),
		forRootAsync: vi.fn().mockReturnValue({
			module: class MockThrottlerModule {},
			providers: [],
			exports: [],
		}),
	},
	ThrottlerGuard: class MockThrottlerGuard {},
}));

// Mock de @nestjs/schedule
vi.mock('@nestjs/schedule', () => ({
	ScheduleModule: {
		forRoot: vi.fn().mockReturnValue({
			module: class MockScheduleModule {},
			providers: [],
			exports: [],
		}),
	},
	Cron: () => (target: any, key: string, descriptor: PropertyDescriptor) =>
		descriptor,
	Interval: () => (target: any, key: string, descriptor: PropertyDescriptor) =>
		descriptor,
	Timeout: () => (target: any, key: string, descriptor: PropertyDescriptor) =>
		descriptor,
}));
