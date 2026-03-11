import { config } from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Sequelize } from 'sequelize-typescript';
import { RolRepository } from '@/modules/security/rol/repository/rol.repository';
import { Role } from '@/modules/security/rol/entities/rol.entity';
import { User } from '@/modules/security/user/entities/user.entity';
import { TypeRol } from '@/modules/security/rol/enum/rolData';

// Load test environment variables manually
const envConfig = config({ path: '.env.test' });
if (envConfig.parsed) {
	Object.entries(envConfig.parsed).forEach(([key, value]) => {
		process.env[key] = value;
	});
}

// Helper function to generate UUIDs
const generateUid = () => globalThis.crypto.randomUUID();

describe.skip('RolRepository Integration', () => {
	let repository: RolRepository;
	let sequelize: Sequelize;

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
		console.log('DB Config:', {
			host: process.env.DATABASE_HOST,
			port: process.env.DATABASE_PORT,
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
		});

		// Crear conexión a la base de datos
		sequelize = new Sequelize({
			...dbConfig,
			models: [Role, User],
			logging: false,
		} as any);

		try {
			await sequelize.authenticate();
			console.log('Connection has been established successfully.');
		} catch (error) {
			console.error('Unable to connect to the database:', error);
			throw error;
		}

		await sequelize.sync({ alter: true });
		console.log('Database synced.');

		const module: TestingModule = await Test.createTestingModule({
			imports: [CacheModule.register()],
			providers: [
				RolRepository,
				{
					provide: 'RoleRepository',
					useFactory: () => sequelize.getRepository(Role),
				},
				{
					provide: CACHE_MANAGER,
					useValue: mockCacheManager,
				},
			],
		}).compile();

		repository = module.get<RolRepository>(RolRepository);
		console.log('Repository initialized');
	});

	afterAll(async () => {
		await sequelize.close();
	});

	beforeEach(async () => {
		// Limpiar la tabla Roles antes de cada test
		await sequelize.getRepository(Role).destroy({ where: {} });
	});

	describe('create', () => {
		it('should create a role successfully', async () => {
			const mockRole = {
				uid: generateUid(),
				name: 'Test Role',
				description: 'Test role for integration tests',
				typeRol: TypeRol.user,
				permissions: ['USER_READ', 'USER_WRITE'],
				status: true,
			} as Role;

			const result = await repository.create(mockRole);

			expect(result).toBeDefined();
			expect(result.name).toBe('Test Role');
			expect(result.typeRol).toBe(TypeRol.user);

			// Verify role was actually persisted
			const foundRole = await sequelize.getRepository(Role).findOne({
				where: { name: 'Test Role' },
			});
			expect(foundRole).toBeDefined();
			expect(foundRole?.name).toBe('Test Role');
		});

		it('should handle unique constraint violation on name', async () => {
			const mockRole = {
				uid: generateUid(),
				name: 'Unique Role',
				description: 'Test role',
				typeRol: TypeRol.user,
				permissions: ['USER_READ'],
				status: true,
			} as Role;

			await repository.create(mockRole);

			const duplicateRole = {
				...mockRole,
				uid: generateUid(),
			} as Role;

			await expect(repository.create(duplicateRole)).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('should find a role by name', async () => {
			const mockRole = {
				uid: generateUid(),
				name: 'Find One Role',
				description: 'Test role',
				typeRol: TypeRol.admin,
				permissions: ['SUPER'],
				status: true,
			} as Role;

			await repository.create(mockRole);

			const result = await repository.findOne({
				where: { name: 'Find One Role' },
			});

			expect(result).toBeDefined();
			expect(result?.name).toBe('Find One Role');
			expect(result?.typeRol).toBe(TypeRol.admin);
		});

		it('should return null when role not found', async () => {
			const result = await repository.findOne({
				where: { name: 'Nonexistent Role' },
			});

			expect(result).toBeNull();
		});

		it('should find role with specific attributes', async () => {
			const mockRole = {
				uid: generateUid(),
				name: 'Attributes Role',
				description: 'Test role with attributes',
				typeRol: TypeRol.user,
				permissions: ['USER_READ', 'USER_WRITE'],
				status: true,
			} as Role;

			await repository.create(mockRole);

			const result = await repository.findOne({
				where: { name: 'Attributes Role' },
				attributes: ['uid', 'name', 'typeRol'],
			});

			expect(result).toBeDefined();
			expect(result?.name).toBe('Attributes Role');
		});
	});

	describe('findAll', () => {
		it('should return all active roles', async () => {
			const roles = [
				{
					uid: generateUid(),
					name: 'Role 1',
					description: 'First role',
					typeRol: TypeRol.user,
					permissions: ['USER_READ'],
					status: true,
				},
				{
					uid: generateUid(),
					name: 'Role 2',
					description: 'Second role',
					typeRol: TypeRol.admin,
					permissions: ['SUPER'],
					status: true,
				},
			] as Role[];

			for (const role of roles) {
				await repository.create(role);
			}

			const result = await repository.findAll({
				where: { status: true },
			});

			expect(result.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('findAndCountAll', () => {
		it('should return paginated roles with count', async () => {
			const roles = [
				{
					uid: generateUid(),
					name: 'Role 1',
					description: 'First role',
					typeRol: TypeRol.user,
					permissions: ['USER_READ'],
					status: true,
				},
				{
					uid: generateUid(),
					name: 'Role 2',
					description: 'Second role',
					typeRol: TypeRol.admin,
					permissions: ['SUPER'],
					status: true,
				},
				{
					uid: generateUid(),
					name: 'Role 3',
					description: 'Third role',
					typeRol: TypeRol.user,
					permissions: ['USER_WRITE'],
					status: true,
				},
			] as Role[];

			for (const role of roles) {
				await repository.create(role);
			}

			const result = await repository.findAndCountAll({
				limit: 2,
				offset: 0,
				order: [['name', 'ASC']],
			});

			expect(result.count).toBeGreaterThanOrEqual(3);
			expect(result.rows.length).toBe(2);
		});

		it('should filter roles by typeRol', async () => {
			const roles = [
				{
					uid: generateUid(),
					name: 'Admin Role',
					description: 'Admin role',
					typeRol: TypeRol.admin,
					permissions: ['SUPER'],
					status: true,
				},
				{
					uid: generateUid(),
					name: 'User Role',
					description: 'User role',
					typeRol: TypeRol.user,
					permissions: ['USER_READ'],
					status: true,
				},
			] as Role[];

			for (const role of roles) {
				await repository.create(role);
			}

			const result = await repository.findAndCountAll({
				where: { typeRol: TypeRol.admin },
				limit: 10,
				offset: 0,
			});

			expect(result.count).toBeGreaterThanOrEqual(1);
			result.rows.forEach(role => {
				expect(role.typeRol).toBe(TypeRol.admin);
			});
		});
	});

	describe('update', () => {
		it('should update role successfully', async () => {
			const mockRole = {
				uid: generateUid(),
				name: 'Update Role',
				description: 'Role to update',
				typeRol: TypeRol.user,
				permissions: ['USER_READ'],
				status: true,
			} as Role;

			await repository.create(mockRole);

			await repository.update(mockRole.uid, {
				name: 'Updated Role',
				description: 'Updated description',
			});

			// Verify persistence
			const foundRole = await sequelize.getRepository(Role).findOne({
				where: { uid: mockRole.uid },
			});
			expect(foundRole?.name).toBe('Updated Role');
			expect(foundRole?.description).toBe('Updated description');
		});

		it('should not throw error when updating non-existent role', async () => {
			// The update method catches errors internally and doesn't throw
			await expect(
				repository.update(generateUid(), {
					name: 'Non-existent Role',
				}),
			).resolves.not.toThrow();
		});
	});

	describe('remove', () => {
		it('should remove role successfully', async () => {
			const mockRole = {
				uid: generateUid(),
				name: 'Remove Role',
				description: 'Role to remove',
				typeRol: TypeRol.user,
				permissions: ['USER_READ'],
				status: true,
			} as Role;

			await repository.create(mockRole);

			await repository.remove(mockRole.uid);

			// Verify deletion
			const foundRole = await sequelize.getRepository(Role).findOne({
				where: { uid: mockRole.uid },
			});
			expect(foundRole).toBeNull();
		});

		it('should not throw error when removing non-existent role', async () => {
			// The remove method catches errors internally and doesn't throw
			await expect(repository.remove(generateUid())).resolves.not.toThrow();
		});
	});
});
