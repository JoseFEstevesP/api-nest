import { FindUserForAuthUseCase } from '@/modules/security/user/use-case/findUserById.use-case';
import { FindOneRolUseCase } from '@/modules/security/rol/use-case/findOneRol.use-case';
import { CreateAuditUseCase } from '@/modules/security/audit/use-case/createAudit.use-case';
import { ValidateAttemptUseCase } from '@/modules/security/user/use-case/validateAttempt.use-case';
import { UserRepository } from '@/modules/security/user/repository/user.repository';
import { RolRepository } from '@/modules/security/rol/repository/rol.repository';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindUserForAuthUseCase', () => {
	let useCase: FindUserForAuthUseCase;
	let mockUserRepository: any;

	beforeEach(() => {
		mockUserRepository = {
			findOne: vi.fn(),
		};

		useCase = new FindUserForAuthUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should return user when found by email', async () => {
			const mockUser = { uid: '123', names: 'John', email: 'john@test.com' };
			mockUserRepository.findOne.mockResolvedValue(mockUser);

			const result = await useCase.execute('john@test.com');

			expect(mockUserRepository.findOne).toHaveBeenCalledWith({
				where: { email: 'john@test.com' },
				include: expect.any(Array),
			});
			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found', async () => {
			mockUserRepository.findOne.mockResolvedValue(null);

			const result = await useCase.execute('notfound@test.com');

			expect(result).toBeNull();
		});
	});
});

describe('FindOneRolUseCase', () => {
	let useCase: FindOneRolUseCase;
	let mockRolRepository: any;

	beforeEach(() => {
		mockRolRepository = {
			findOne: vi.fn(),
		};

		useCase = new FindOneRolUseCase(mockRolRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should return role when found', async () => {
			const mockRole = { uid: '123', name: 'admin', typeRol: 'admin' };
			mockRolRepository.findOne.mockResolvedValue(mockRole);

			const result = await useCase.execute({ typeRol: 'admin' });

			expect(mockRolRepository.findOne).toHaveBeenCalledWith({
				where: { typeRol: 'admin', status: true },
				attributes: { exclude: ['createdAt', 'updatedAt', 'status'] },
			});
			expect(result).toEqual(mockRole);
		});

		it('should throw NotFoundException when role not found', async () => {
			mockRolRepository.findOne.mockResolvedValue(null);

			await expect(useCase.execute({ typeRol: 'nonexistent' })).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});

describe('CreateAuditUseCase', () => {
	let useCase: CreateAuditUseCase;
	let mockAuditRepository: any;

	beforeEach(() => {
		mockAuditRepository = {
			findOne: vi.fn(),
			create: vi.fn(),
		};

		useCase = new CreateAuditUseCase(mockAuditRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should create audit successfully', async () => {
			const mockAudit = {
				uid: '123',
				uidUser: 'user1',
				refreshToken: 'token123',
			};
			mockAuditRepository.findOne.mockResolvedValue(null);
			mockAuditRepository.create.mockResolvedValue(mockAudit);

			const result = await useCase.execute({ data: mockAudit });

			expect(mockAuditRepository.findOne).toHaveBeenCalled();
			expect(mockAuditRepository.create).toHaveBeenCalledWith(
				mockAudit,
				undefined,
			);
			expect(result).toEqual(mockAudit);
		});

		it('should throw ConflictException when audit already exists', async () => {
			const mockAudit = { uid: '123', uidUser: 'user1' };
			mockAuditRepository.findOne.mockResolvedValue(mockAudit);

			await expect(useCase.execute({ data: mockAudit })).rejects.toThrow();
		});
	});
});

describe('ValidateAttemptUseCase', () => {
	let useCase: ValidateAttemptUseCase;
	let mockUserRepository: any;

	beforeEach(() => {
		mockUserRepository = {
			update: vi.fn().mockResolvedValue(true),
		};

		useCase = new ValidateAttemptUseCase(mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should increment attempt count when below max', async () => {
			const mockUser = { uid: '123', attemptCount: 2 };

			await useCase.execute({ user: mockUser as any });

			expect(mockUserRepository.update).toHaveBeenCalledWith('123', {
				attemptCount: 3,
			});
		});

		it('should throw ForbiddenException when attempts exceed max', async () => {
			const mockUser = { uid: '123', attemptCount: 4 };

			await expect(
				useCase.execute({ user: mockUser as any, maxAttempt: 4 }),
			).rejects.toThrow();
			expect(mockUserRepository.update).toHaveBeenCalledWith('123', {
				attemptCount: 4,
				status: false,
			});
		});
	});
});
