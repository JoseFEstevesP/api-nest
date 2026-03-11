import { config } from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Sequelize } from 'sequelize-typescript';
import { LoginUseCase } from '@/modules/security/auth/use-case/login.use-case';
import { LogoutUseCase } from '@/modules/security/auth/use-case/logout.use-case';
import { RefreshTokenUseCase } from '@/modules/security/auth/use-case/refreshToken.use-case';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { User } from '@/modules/security/user/entities/user.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';
import { FindUserForAuthUseCase } from '@/modules/security/user/use-case/findUserById.use-case';
import { ValidateAttemptUseCase } from '@/modules/security/user/use-case/validateAttempt.use-case';
import { FindOneUserUseCase } from '@/modules/security/user/use-case/findOneUser.use-case';
import { FindOneAuditUseCase } from '@/modules/security/audit/use-case/findOneAudit.use-case';
import { UpdateAuditUseCase } from '@/modules/security/audit/use-case/updateAudit.use-case';
import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { TypeRol } from '@/modules/security/rol/enum/rolData';
import { AuthLoginDTO } from '@/modules/security/auth/dto/authLogin.dto';
import { hash } from 'bcrypt';

// Load test environment variables manually
const envConfig = config({ path: '.env.test' });
if (envConfig.parsed) {
	Object.entries(envConfig.parsed).forEach(([key, value]) => {
		process.env[key] = value;
	});
}

// Helper function to generate UUIDs
const generateUid = () => globalThis.crypto.randomUUID();

describe('Auth Use Cases Integration', () => {
	let sequelize: Sequelize;
	let loginUseCase: LoginUseCase;
	let logoutUseCase: LogoutUseCase;
	let refreshTokenUseCase: RefreshTokenUseCase;
	let userRepository: UserRepository;
	let auditRepository: AuditRepository;
	let jwtService: JwtService;
	let testUser: User;
	let userRole: Role;

	const dbConfig = {
		dialect: 'postgres',
		host: process.env.DATABASE_HOST || 'localhost',
		port: Number(process.env.DATABASE_PORT) || 5432,
		username: process.env.POSTGRES_USER || 'api_nest',
		password: process.env.POSTGRES_PASSWORD || 'api_nest',
		database: process.env.POSTGRES_DB || 'test_db',
		logging: false,
	};

	const mockConfigService = {
		get: jest.fn((key: string) => {
			switch (key) {
				case 'NODE_ENV':
					return 'test';
				case 'JWT_SECRET':
					return 'test-secret-key-for-tests';
				case 'JWT_REFRESH_SECRET':
					return 'test-refresh-secret-for-tests';
				default:
					return null;
			}
		}),
	};

	beforeAll(async () => {
		// Crear conexión a la base de datos
		sequelize = new Sequelize({
			...dbConfig,
			models: [User, Role, Audit],
		});

		await sequelize.sync({ force: true });

		const module: TestingModule = await Test.createTestingModule({
			imports: [
				CacheModule.register({ isGlobal: true }),
				ConfigModule,
				JwtModule.register({
					secret: 'test-secret-key-for-tests',
					signOptions: { expiresIn: '1h' },
				}),
			],
			providers: [
				UserRepository,
				AuditRepository,
				LoginUseCase,
				LogoutUseCase,
				RefreshTokenUseCase,
				FindUserForAuthUseCase,
				ValidateAttemptUseCase,
				FindOneUserUseCase,
				FindOneAuditUseCase,
				UpdateAuditUseCase,
				RemoveAuditUseCase,
				CreateAuditUseCase,
				{
					provide: getModelToken(User),
					useFactory: () => sequelize.getRepository(User),
				},
				{
					provide: getModelToken(Role),
					useFactory: () => sequelize.getRepository(Role),
				},
				{
					provide: getModelToken(Audit),
					useFactory: () => sequelize.getRepository(Audit),
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
			],
		}).compile();

		userRepository = module.get<UserRepository>(UserRepository);
		auditRepository = module.get<AuditRepository>(AuditRepository);
		loginUseCase = module.get<LoginUseCase>(LoginUseCase);
		logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
		refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
		jwtService = module.get<JwtService>(JwtService);

		// Crear rol por defecto
		const roleRepo = sequelize.getRepository(Role);
		userRole = await roleRepo.create({
			uid: '91a9f962-9255-4125-b5a7-539351e8c1ad',
			name: 'super',
			description: 'rol de super usuario',
			typeRol: 'admin',
			permissions: ['SUPER'],
			status: true,
		});

		// Crear usuario de prueba con contraseña conocida
		const hashedPassword = await hash('P@ssw0rd123', 10);
		const userRepo = sequelize.getRepository(User);
		testUser = await userRepo.create({
			uid: generateUid(),
			names: 'Test',
			surnames: 'User',
			email: 'test@example.com',
			phone: '04141000001',
			password: hashedPassword,
			provider: 'local',
			status: true,
			code: null,
			activatedAccount: true,
			attemptCount: 0,
			uidRol: userRole.uid,
		});
	});

	afterAll(async () => {
		await sequelize.close();
	});

	beforeEach(async () => {
		// Limpiar la tabla Audit antes de cada test
		await sequelize.getRepository(Audit).destroy({ where: {} });
		// Reset attempt count
		await testUser.update({ attemptCount: 0 });
	});

	describe('LoginUseCase', () => {
		it('should login successfully with valid credentials', async () => {
			const mockRes = {
				cookie: jest.fn().mockReturnThis(),
				clearCookie: jest.fn(),
			} as any;

			const loginData: AuthLoginDTO = {
				email: 'test@example.com',
				password: 'P@ssw0rd123',
			};

			const loginInfo = {
				ip: '127.0.0.1',
				userAgent: 'test-agent',
			};

			await loginUseCase.execute({
				data: loginData,
				res: mockRes,
				loginInfo: loginInfo as any,
			});

			// Verify cookies were set
			expect(mockRes.cookie).toHaveBeenCalledWith(
				'accessToken',
				expect.any(String),
				expect.any(Object),
			);
			expect(mockRes.cookie).toHaveBeenCalledWith(
				'refreshToken',
				expect.any(String),
				expect.any(Object),
			);

			// Verify audit record was created
			const auditRecords = await sequelize.getRepository(Audit).findAll();
			expect(auditRecords.length).toBeGreaterThan(0);
		});

		it('should throw NotFoundException with non-existent user', async () => {
			const mockRes = {
				cookie: jest.fn().mockReturnThis(),
			} as any;

			const loginData: AuthLoginDTO = {
				email: 'nonexistent@example.com',
				password: 'P@ssw0rd123',
			};

			await expect(
				loginUseCase.execute({
					data: loginData,
					res: mockRes,
					loginInfo: {} as any,
				}),
			).rejects.toThrow('Usuario no encontrado');
		});

		it('should throw UnauthorizedException with invalid password', async () => {
			const mockRes = {
				cookie: jest.fn().mockReturnThis(),
			} as any;

			const loginData: AuthLoginDTO = {
				email: 'test@example.com',
				password: 'wrongpassword',
			};

			await expect(
				loginUseCase.execute({
					data: loginData,
					res: mockRes,
					loginInfo: {} as any,
				}),
			).rejects.toThrow('Credenciales no válidos');
		});
	});

	describe('LogoutUseCase', () => {
		it('should throw UnauthorizedException without refresh token', async () => {
			const mockRes = {
				clearCookie: jest.fn(),
			} as any;

			await expect(
				logoutUseCase.execute({
					uid: testUser.uid,
					res: mockRes,
					dataLog: 'test-data',
				}),
			).rejects.toThrow('No se encontró el token de refresco');
		});

		it('should throw NotFoundException when audit not found', async () => {
			const mockRes = {
				clearCookie: jest.fn(),
			} as any;

			await expect(
				logoutUseCase.execute({
					refreshToken: 'non-existent-token',
					res: mockRes,
					dataLog: 'test-data',
				}),
			).rejects.toThrow('No se ha encontrado ningún registro de auditoría');
		});
	});

	describe('RefreshTokenUseCase', () => {
		it('should refresh token successfully with valid refresh token', async () => {
			// Create audit record first
			const auditRepo = sequelize.getRepository(Audit);
			const oldRefreshToken = 'old-refresh-token';
			const auditRecord = await auditRepo.create({
				uid: generateUid(),
				uidUser: testUser.uid,
				refreshToken: oldRefreshToken,
				dataToken: ['127.0.0.1', 'test-agent'],
			});

			const mockReq = {
				cookies: {
					refreshToken: oldRefreshToken,
				},
				user: {
					uid: testUser.uid,
					uidRol: testUser.uidRol,
					dataLog: 'Test User',
					ip: '127.0.0.1',
					userAgent: 'test-agent',
				},
			} as any;

			const mockRes = {
				cookie: jest.fn().mockReturnThis(),
				clearCookie: jest.fn(),
			} as any;

			const loginInfo = {
				ip: '127.0.0.1',
				userAgent: 'test-agent',
			};

			await refreshTokenUseCase.execute({
				req: mockReq,
				res: mockRes,
				loginInfo: loginInfo as any,
			});

			// Verify new cookies were set
			expect(mockRes.cookie).toHaveBeenCalledWith(
				'accessToken',
				expect.any(String),
				expect.any(Object),
			);
			expect(mockRes.cookie).toHaveBeenCalledWith(
				'refreshToken',
				expect.any(String),
				expect.any(Object),
			);

			// Verify audit was updated with new refresh token
			const updatedAudit = await auditRepo.findByPk(auditRecord.uid);
			expect(updatedAudit?.refreshToken).not.toBe(oldRefreshToken);
		});

		it('should logout when refresh token not found in audit', async () => {
			const mockReq = {
				cookies: {
					refreshToken: 'non-existent-token',
				},
				user: {
					uid: testUser.uid,
					uidRol: testUser.uidRol,
					dataLog: 'Test User',
					ip: '127.0.0.1',
					userAgent: 'test-agent',
				},
			} as any;

			const mockRes = {
				cookie: jest.fn().mockReturnThis(),
				clearCookie: jest.fn(),
			} as any;

			const loginInfo = {
				ip: '127.0.0.1',
				userAgent: 'test-agent',
			};

			// This should trigger logout which will throw NotFoundException
			// because the audit doesn't exist
			await expect(
				refreshTokenUseCase.execute({
					req: mockReq,
					res: mockRes,
					loginInfo: loginInfo as any,
				}),
			).rejects.toThrow('No se ha encontrado ningún registro de auditoría');
		});

		it('should throw UnauthorizedException without refresh token in cookies', async () => {
			const mockReq = {
				cookies: {},
			} as any;

			const mockRes = {
				clearCookie: jest.fn(),
			} as any;

			const loginInfo = {
				ip: '127.0.0.1',
				userAgent: 'test-agent',
			};

			await expect(
				refreshTokenUseCase.execute({
					req: mockReq,
					res: mockRes,
					loginInfo: loginInfo as any,
				}),
			).rejects.toThrow('No se encontró el token de refresco');
		});
	});
});
