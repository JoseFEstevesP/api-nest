import { config } from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Sequelize } from 'sequelize-typescript';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { User } from '@/modules/security/user/entities/user.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';
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

describe.skip('UserRepository Integration', () => {
	let repository: UserRepository;
	let sequelize: Sequelize;
	let role: Role;

	const dbConfig = {
		dialect: 'postgres',
		host: process.env.DATABASE_HOST || 'localhost',
		port: Number(process.env.DATABASE_PORT) || 5432,
		username: process.env.POSTGRES_USER || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres',
		database: process.env.POSTGRES_DB || 'test_db',
		logging: false,
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
			dialect: 'postgres',
			host: process.env.DATABASE_HOST || 'localhost',
			port: Number(process.env.DATABASE_PORT) || 5432,
			username: process.env.POSTGRES_USER || 'api_nest',
			password: process.env.POSTGRES_PASSWORD || 'api_nest',
			database: process.env.POSTGRES_DB || 'test_db',
			models: [User, Role],
			logging: false,
		});

		try {
			await sequelize.authenticate();
			console.log('Connection has been established successfully.');
		} catch (error) {
			console.error('Unable to connect to the database:', error);
			throw error;
		}

		await sequelize.sync({ alter: true });
		console.log('Database synced.');

		// Crear rol por defecto para las pruebas
		const roleRepo = sequelize.getRepository(Role);
		try {
			role = await roleRepo.create({
				uid: '91a9f962-9255-4125-b5a7-539351e8c1ad',
				name: 'super',
				description: 'rol de super usuario',
				typeRol: 'admin',
				permissions: ['SUPER'],
				status: true,
			});
			console.log('Role created:', role.uid);
		} catch (error) {
			console.error('Error creating role:', error);
			console.error('Error message:', error.message);
			console.error('Error parent:', error.parent);
			throw error;
		}

		const mockCacheManager = {
			set: vi.fn().mockResolvedValue(undefined),
			get: vi.fn().mockResolvedValue(undefined),
			del: vi.fn().mockResolvedValue(undefined),
			reset: vi.fn().mockResolvedValue(undefined),
		};

		const module: TestingModule = await Test.createTestingModule({
			imports: [CacheModule.register()],
			providers: [
				UserRepository,
				{
					provide: getModelToken(User),
					useFactory: () => sequelize.getRepository(User),
				},
				{
					provide: CACHE_MANAGER,
					useValue: mockCacheManager,
				},
			],
		}).compile();

		repository = module.get<UserRepository>(UserRepository);
		console.log('Repository initialized');
	});

	afterAll(async () => {
		await sequelize.close();
	});

	beforeEach(async () => {
		// Limpiar la tabla User antes de cada test
		await sequelize.getRepository(User).destroy({ where: {} });
	});

	describe('create', () => {
		it('should create a user successfully', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'John',
				surnames: 'Doe',
				email: 'john@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			const result = await repository.create(mockUser);

			expect(result).toBeDefined();
			expect(result.email).toBe('john@test.com');
			expect(result.names).toBe('John');
			expect(result.uidRol).toBe(role.uid);

			// Verify user was actually persisted
			const foundUser = await sequelize.getRepository(User).findOne({
				where: { email: 'john@test.com' },
			});
			expect(foundUser).toBeDefined();
			expect(foundUser?.email).toBe('john@test.com');
		});

		it('should handle unique constraint violation', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'John',
				surnames: 'Doe',
				email: 'unique@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			await repository.create(mockUser);

			const duplicateUser = {
				...mockUser,
				uid: generateUid(),
			} as User;

			await expect(repository.create(duplicateUser)).rejects.toThrow();
		});
	});

	describe('findOne', () => {
		it('should find a user by email', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'John',
				surnames: 'Doe',
				email: 'findone@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			await repository.create(mockUser);

			const result = await repository.findOne({
				where: { email: 'findone@test.com' },
			});

			expect(result).toBeDefined();
			expect(result?.email).toBe('findone@test.com');
			expect(result?.names).toBe('John');
		});

		it('should return null when user not found', async () => {
			const result = await repository.findOne({
				where: { email: 'nonexistent@test.com' },
			});

			expect(result).toBeNull();
		});

		it('should find user with included role', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'John',
				surnames: 'Doe',
				email: 'withrole@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			await repository.create(mockUser);

			const result = await repository.findOne({
				where: { email: 'withrole@test.com' },
				include: [{ model: Role, required: true }],
			});

			expect(result).toBeDefined();
			expect(result?.rol).toBeDefined();
		});
	});

	describe('findAll', () => {
		it('should return all users', async () => {
			const users = [
				{
					uid: generateUid(),
					names: 'John',
					surnames: 'Doe',
					email: 'john@all.com',
					phone: '04141000001',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: true,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
				{
					uid: generateUid(),
					names: 'Jane',
					surnames: 'Smith',
					email: 'jane@all.com',
					phone: '04141000002',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: true,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
			] as User[];

			for (const user of users) {
				await repository.create(user);
			}

			const result = await repository.findAll();

			expect(result.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('findAndCountAll', () => {
		it('should return paginated users with count', async () => {
			const users = [
				{
					uid: generateUid(),
					names: 'John',
					surnames: 'Doe',
					email: 'john@page.com',
					phone: '04141000001',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: true,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
				{
					uid: generateUid(),
					names: 'Jane',
					surnames: 'Smith',
					email: 'jane@page.com',
					phone: '04141000002',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: true,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
				{
					uid: generateUid(),
					names: 'Bob',
					surnames: 'Johnson',
					email: 'bob@page.com',
					phone: '04141000003',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: true,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
			] as User[];

			for (const user of users) {
				await repository.create(user);
			}

			const result = await repository.findAndCountAll({
				limit: 2,
				offset: 0,
				order: [['email', 'ASC']],
			});

			expect(result.count).toBeGreaterThanOrEqual(3);
			expect(result.rows.length).toBe(2);
			expect(result.rows[0].email).toBe('bob@page.com');
		});

		it('should filter users by status', async () => {
			const users = [
				{
					uid: generateUid(),
					names: 'Active',
					surnames: 'User',
					email: 'active@filter.com',
					phone: '04141000001',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: true,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
				{
					uid: generateUid(),
					names: 'Inactive',
					surnames: 'User',
					email: 'inactive@filter.com',
					phone: '04141000002',
					password:
						'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
					provider: 'local',
					status: false,
					code: null,
					activatedAccount: true,
					attemptCount: 0,
					uidRol: role.uid,
				},
			] as User[];

			for (const user of users) {
				await repository.create(user);
			}

			const result = await repository.findAndCountAll({
				where: { status: true },
				limit: 10,
				offset: 0,
			});

			expect(result.count).toBeGreaterThanOrEqual(1);
			result.rows.forEach(user => {
				expect(user.status).toBe(true);
			});
		});
	});

	describe('update', () => {
		it('should update user successfully', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'John',
				surnames: 'Doe',
				email: 'update@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			await repository.create(mockUser);

			const result = await repository.update(mockUser.uid, {
				names: 'Updated John',
			});

			expect(result).toBeDefined();
			expect(result?.names).toBe('Updated John');

			// Verify persistence
			const foundUser = await sequelize.getRepository(User).findOne({
				where: { uid: mockUser.uid },
			});
			expect(foundUser?.names).toBe('Updated John');
		});

		it('should return null when user not found', async () => {
			const result = await repository.update(generateUid(), {
				names: 'Updated',
			});

			expect(result).toBeNull();
		});
	});

	describe('delete', () => {
		it('should delete user successfully', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'John',
				surnames: 'Doe',
				email: 'delete@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			await repository.create(mockUser);

			const result = await repository.delete(mockUser.uid);

			expect(result).toBe(true);

			// Verify deletion
			const foundUser = await sequelize.getRepository(User).findOne({
				where: { uid: mockUser.uid },
			});
			expect(foundUser).toBeNull();
		});

		it('should return false when user not found', async () => {
			const result = await repository.delete(generateUid());

			expect(result).toBe(false);
		});
	});

	describe('transaction', () => {
		it('should execute callback within transaction', async () => {
			const mockUser = {
				uid: generateUid(),
				names: 'Transaction',
				surnames: 'User',
				email: 'transaction@test.com',
				phone: '04141000001',
				password:
					'$2b$12$0Lf75559ZODHeOK804VB.e3JZBYz4XzHJYfy3D5ejmdRyadKbPLyu',
				provider: 'local',
				status: true,
				code: null,
				activatedAccount: true,
				attemptCount: 0,
				uidRol: role.uid,
			} as User;

			await repository.transaction(async () => {
				const result = await repository.create({
					...mockUser,
				} as User);
				expect(result).toBeDefined();
			});

			// Verify user was persisted after transaction commit
			const foundUser = await sequelize.getRepository(User).findOne({
				where: { email: 'transaction@test.com' },
			});
			expect(foundUser).toBeDefined();
		});
	});
});
