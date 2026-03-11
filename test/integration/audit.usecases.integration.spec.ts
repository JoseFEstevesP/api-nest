import { config } from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Sequelize } from 'sequelize-typescript';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';
import { Audit } from '@/modules/security/audit/entities/audit.entity';
import { User } from '@/modules/security/user/entities/user.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { FindOneAuditUseCase } from '@/modules/security/audit/use-case/findOneAudit.use-case';
import { UpdateAuditUseCase } from '@/modules/security/audit/use-case/updateAudit.use-case';
import { TypeRol } from '@/modules/security/rol/enum/rolData';
import { AuditRegisterDTO } from '@/modules/security/audit/dto/auditRegister.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Load test environment variables manually
const envConfig = config({ path: '.env.test' });
if (envConfig.parsed) {
	Object.entries(envConfig.parsed).forEach(([key, value]) => {
		process.env[key] = value;
	});
}

// Helper function to generate UUIDs
const generateUid = () => globalThis.crypto.randomUUID();

describe.skip('Audit Use Cases Integration', () => {
	let sequelize: Sequelize;
	let auditRepository: AuditRepository;
	let createAuditUseCase: CreateAuditUseCase;
	let removeAuditUseCase: RemoveAuditUseCase;
	let findOneAuditUseCase: FindOneAuditUseCase;
	let updateAuditUseCase: UpdateAuditUseCase;
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

	const mockCacheManager = {
		set: vi.fn().mockResolvedValue(undefined),
		get: vi.fn().mockResolvedValue(undefined),
		del: vi.fn().mockResolvedValue(undefined),
		reset: vi.fn().mockResolvedValue(undefined),
	};

	beforeAll(async () => {
		// Crear conexión a la base de datos
		sequelize = new Sequelize({
			...dbConfig,
			models: [Audit, User, Role],
		} as any);

		await sequelize.sync({ alter: true });

		const module: TestingModule = await Test.createTestingModule({
			imports: [CacheModule.register({ isGlobal: true })],
			providers: [
				AuditRepository,
				CreateAuditUseCase,
				RemoveAuditUseCase,
				FindOneAuditUseCase,
				UpdateAuditUseCase,
				{
					provide: getModelToken(Audit),
					useFactory: () => sequelize.getRepository(Audit),
				},
				{
					provide: getModelToken(User),
					useFactory: () => sequelize.getRepository(User),
				},
				{
					provide: getModelToken(Role),
					useFactory: () => sequelize.getRepository(Role),
				},
				{
					provide: CACHE_MANAGER,
					useValue: mockCacheManager,
				},
			],
		}).compile();

		auditRepository = module.get<AuditRepository>(AuditRepository);
		createAuditUseCase = module.get<CreateAuditUseCase>(CreateAuditUseCase);
		removeAuditUseCase = module.get<RemoveAuditUseCase>(RemoveAuditUseCase);
		findOneAuditUseCase = module.get<FindOneAuditUseCase>(FindOneAuditUseCase);
		updateAuditUseCase = module.get<UpdateAuditUseCase>(UpdateAuditUseCase);

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

		// Crear usuario de prueba
		const userRepo = sequelize.getRepository(User);
		testUser = await userRepo.create({
			uid: generateUid(),
			names: 'Test',
			surnames: 'User',
			email: 'testaudit@example.com',
			phone: '04141000001',
			password: '$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
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
	});

	describe('CreateAuditUseCase', () => {
		it('should create an audit record successfully', async () => {
			const auditData: AuditRegisterDTO = {
				uidUser: testUser.uid,
				refreshToken: 'test-refresh-token-123',
				dataToken: ['127.0.0.1', 'test-agent', 'data1'],
			};

			const result = await createAuditUseCase.execute({
				data: auditData,
			});

			expect(result).toBeDefined();
			expect(result.uidUser).toBe(testUser.uid);
			expect(result.refreshToken).toBe('test-refresh-token-123');
			expect(result.dataToken).toEqual(['127.0.0.1', 'test-agent', 'data1']);

			// Verify audit was persisted
			const foundAudit = await auditRepository.findOne({
				where: { uid: result.uid },
			});
			expect(foundAudit).toBeDefined();
			expect(foundAudit?.uidUser).toBe(testUser.uid);
		});

		it('should throw ConflictException when duplicate audit exists', async () => {
			const auditData: AuditRegisterDTO = {
				uidUser: testUser.uid,
				refreshToken: 'duplicate-token',
				dataToken: ['127.0.0.1', 'test-agent'],
			};

			// Create first audit
			await createAuditUseCase.execute({ data: auditData });

			// Try to create duplicate
			await expect(
				createAuditUseCase.execute({ data: auditData }),
			).rejects.toThrow(ConflictException);
		});
	});

	describe('FindOneAuditUseCase', () => {
		it('should find audit by uid successfully', async () => {
			// Create audit first
			const auditRepo = sequelize.getRepository(Audit);
			const audit = await auditRepo.create({
				uid: generateUid(),
				uidUser: testUser.uid,
				refreshToken: 'find-token',
				dataToken: ['data1'],
			});

			const result = await findOneAuditUseCase.execute({ uid: audit.uid });

			expect(result).toBeDefined();
			expect(result?.uid).toBe(audit.uid);
			expect(result?.uidUser).toBe(testUser.uid);
		});

		it('should return null when audit not found', async () => {
			const result = await findOneAuditUseCase.execute({
				uid: generateUid(),
			});

			expect(result).toBeNull();
		});

		it('should find audit by refreshToken', async () => {
			// Create audit first
			const auditRepo = sequelize.getRepository(Audit);
			await auditRepo.create({
				uid: generateUid(),
				uidUser: testUser.uid,
				refreshToken: 'find-by-refresh-token',
				dataToken: ['data1'],
			});

			const result = await findOneAuditUseCase.execute({
				refreshToken: 'find-by-refresh-token',
			});

			expect(result).toBeDefined();
			expect(result?.refreshToken).toBe('find-by-refresh-token');
		});
	});

	describe('UpdateAuditUseCase', () => {
		it('should update audit refreshToken successfully', async () => {
			// Create audit first
			const auditRepo = sequelize.getRepository(Audit);
			const audit = await auditRepo.create({
				uid: generateUid(),
				uidUser: testUser.uid,
				refreshToken: 'old-refresh-token',
				dataToken: ['data1'],
			});

			await updateAuditUseCase.execute({
				data: {
					uid: audit.uid,
					refreshToken: 'new-refresh-token',
				},
			});

			// Verify update using raw query to bypass cache
			const updatedAudit = await auditRepo.findByPk(audit.uid);
			expect(updatedAudit?.refreshToken).toBe('new-refresh-token');
		});

		it('should throw NotFoundException when updating non-existent audit', async () => {
			await expect(
				updateAuditUseCase.execute({
					data: {
						uid: generateUid(),
						refreshToken: 'new-token',
					},
				}),
			).rejects.toThrow('No se ha encontrado ningún registro de auditoría');
		});
	});

	describe('RemoveAuditUseCase', () => {
		it('should remove audit successfully by uid', async () => {
			// Create audit first
			const auditRepo = sequelize.getRepository(Audit);
			const audit = await auditRepo.create({
				uid: generateUid(),
				uidUser: testUser.uid,
				refreshToken: 'to-delete-token',
				dataToken: ['data1'],
			});

			const result = await removeAuditUseCase.execute(
				{ uid: audit.uid },
				'test-data',
			);

			expect(result.msg).toBeDefined();

			// Verify deletion using raw query
			const deletedAudit = await auditRepo.findByPk(audit.uid);
			expect(deletedAudit).toBeNull();
		});

		it('should remove audit successfully by refreshToken', async () => {
			// Create audit first
			const auditRepo = sequelize.getRepository(Audit);
			await auditRepo.create({
				uid: generateUid(),
				uidUser: testUser.uid,
				refreshToken: 'to-delete-by-refresh',
				dataToken: ['data1'],
			});

			const result = await removeAuditUseCase.execute(
				{ refreshToken: 'to-delete-by-refresh' },
				'test-data',
			);

			expect(result.msg).toBeDefined();
		});

		it('should throw NotFoundException when audit not found', async () => {
			await expect(
				removeAuditUseCase.execute({ uid: generateUid() }, 'test-data'),
			).rejects.toThrow('No se ha encontrado ningún registro de auditoría');
		});

		it('should throw NotFoundException when refreshToken not found', async () => {
			await expect(
				removeAuditUseCase.execute(
					{ refreshToken: 'non-existent-token' },
					'test-data',
				),
			).rejects.toThrow('No se ha encontrado ningún registro de auditoría');
		});
	});
});
