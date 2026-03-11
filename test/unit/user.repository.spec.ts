import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Logger } from '@nestjs/common';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { User } from '@/modules/security/user/entities/user.entity';
import { Role } from '@/modules/security/rol/entities/rol.entity';

describe('UserRepository', () => {
	let repository: UserRepository;
	let mockUserModel: any;
	let mockCacheManager: any;
	let mockLogger: any;

	beforeEach(async () => {
		mockUserModel = {
			create: jest.fn(),
			findOne: jest.fn(),
			findAll: jest.fn(),
			findAndCountAll: jest.fn(),
			update: jest.fn(),
			destroy: jest.fn(),
		};

		mockCacheManager = {
			get: jest.fn(),
			set: jest.fn(),
			del: jest.fn(),
		};

		mockLogger = {
			log: jest.fn(),
			error: jest.fn(),
			warn: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserRepository,
				{
					provide: getModelToken(User),
					useValue: mockUserModel,
				},
				{
					provide: 'CACHE_MANAGER',
					useValue: mockCacheManager,
				},
				{
					provide: Logger,
					useValue: mockLogger,
				},
			],
		}).compile();

		repository = module.get<UserRepository>(UserRepository);
	});

	describe('create', () => {
		it('should create a user successfully', async () => {
			const mockUser = {
				uid: 'test-uid-123',
				names: 'John',
				surnames: 'Doe',
				email: 'john@test.com',
				phone: '1234567890',
				password: 'hashedpassword',
				provider: 'local',
				status: true,
			};

			const createdUser = { ...mockUser, id: 1 };
			mockUserModel.create.mockResolvedValue(createdUser);
			mockCacheManager.reset = jest.fn().mockResolvedValue(undefined);

			const result = await repository.create(mockUser as any);

			expect(mockUserModel.create).toHaveBeenCalledWith(mockUser);
			expect(result).toEqual(createdUser);
		});

		it('should throw error when create fails', async () => {
			const mockUser = { email: 'john@test.com' };
			mockUserModel.create.mockRejectedValue(new Error('Database error'));

			await expect(repository.create(mockUser as any)).rejects.toThrow(
				'Ocurrió un error inesperado durante la creación del usuario.',
			);
		});
	});

	describe('findOne', () => {
		it('should return cached data if available', async () => {
			const cachedUser = { uid: 'test-uid', email: 'cached@test.com' };
			mockCacheManager.get.mockResolvedValue(cachedUser);

			const result = await repository.findOne({
				where: { email: 'cached@test.com' },
			});

			expect(result).toEqual(cachedUser);
			expect(mockUserModel.findOne).not.toHaveBeenCalled();
		});

		it('should fetch from database when not cached', async () => {
			const dbUser = { uid: 'test-uid', email: 'db@test.com' };
			mockCacheManager.get.mockResolvedValue(null);
			mockUserModel.findOne.mockResolvedValue(dbUser);
			mockCacheManager.set.mockResolvedValue(undefined);

			const result = await repository.findOne({
				where: { email: 'db@test.com' },
			});

			expect(mockUserModel.findOne).toHaveBeenCalled();
			expect(result).toEqual(dbUser);
			expect(mockCacheManager.set).toHaveBeenCalled();
		});

		it('should return null when user not found', async () => {
			mockCacheManager.get.mockResolvedValue(null);
			mockUserModel.findOne.mockResolvedValue(null);

			const result = await repository.findOne({
				where: { email: 'notfound@test.com' },
			});

			expect(result).toBeNull();
		});
	});

	describe('findAndCountAll', () => {
		it('should return paginated users', async () => {
			const paginatedResult = {
				rows: [{ uid: '1', email: 'user1@test.com' }],
				count: 1,
			};
			mockCacheManager.get.mockResolvedValue(null);
			mockUserModel.findAndCountAll.mockResolvedValue(paginatedResult);
			mockCacheManager.set.mockResolvedValue(undefined);

			const result = await repository.findAndCountAll({ limit: 10, offset: 0 });

			expect(result).toEqual(paginatedResult);
			expect(mockUserModel.findAndCountAll).toHaveBeenCalledWith({
				limit: 10,
				offset: 0,
			});
		});
	});

	describe('update', () => {
		it('should update user and invalidate cache', async () => {
			const updatedUser = { uid: 'test-uid', names: 'Updated' };
			mockUserModel.update.mockResolvedValue([1]);
			mockUserModel.findOne.mockResolvedValue(updatedUser);
			mockCacheManager.reset = jest.fn().mockResolvedValue(undefined);

			const result = await repository.update('test-uid', { names: 'Updated' });

			expect(mockUserModel.update).toHaveBeenCalled();
			expect(result).toEqual(updatedUser);
		});

		it('should return null when user not found', async () => {
			mockUserModel.update.mockResolvedValue([0]);

			const result = await repository.update('nonexistent', {
				names: 'Updated',
			});

			expect(result).toBeNull();
		});
	});

	describe('delete', () => {
		it('should delete user and invalidate cache', async () => {
			mockUserModel.destroy.mockResolvedValue(1);
			mockCacheManager.reset = jest.fn().mockResolvedValue(undefined);

			const result = await repository.delete('test-uid');

			expect(result).toBe(true);
			expect(mockUserModel.destroy).toHaveBeenCalledWith({
				where: { uid: 'test-uid' },
			});
		});

		it('should return false when user not found', async () => {
			mockUserModel.destroy.mockResolvedValue(0);

			const result = await repository.delete('nonexistent');

			expect(result).toBe(false);
		});
	});
});
