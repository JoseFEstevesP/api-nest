import { CreateRolUseCase } from '@/modules/security/rol/use-case/createRol.use-case';
import { UpdateRolUseCase } from '@/modules/security/rol/use-case/updateRol.use-case';
import { RemoveRolUseCase } from '@/modules/security/rol/use-case/removeRol.use-case';
import { FindAllRolsUseCase } from '@/modules/security/rol/use-case/findAllRols.use-case';
import { RolRepository } from '@/modules/security/rol/repository/rol.repository';
import { UserRepository } from '@/modules/security/user/repository/user.repository';

describe('CreateRolUseCase', () => {
	let useCase: CreateRolUseCase;
	let mockRolRepository: any;

	beforeEach(() => {
		mockRolRepository = {
			findOne: vi.fn().mockResolvedValue(null),
			create: vi.fn().mockResolvedValue({}),
		};

		useCase = new CreateRolUseCase(mockRolRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should create role successfully', async () => {
			const data = { name: 'admin', typeRol: 'admin', permissions: ['all'] };

			const result = await useCase.execute({ data, dataLog: 'test' });

			expect(mockRolRepository.findOne).toHaveBeenCalled();
			expect(mockRolRepository.create).toHaveBeenCalledWith(data);
			expect(result).toEqual({ msg: expect.any(String) });
		});
	});
});

describe('UpdateRolUseCase', () => {
	let useCase: UpdateRolUseCase;
	let mockRolRepository: any;

	beforeEach(() => {
		mockRolRepository = {
			findOne: vi.fn().mockResolvedValue({ uid: '123', name: 'old' }),
			update: vi.fn().mockResolvedValue([1]),
		};

		useCase = new UpdateRolUseCase(mockRolRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should update role successfully', async () => {
			const data = { uid: '123', name: 'updated' };

			const result = await useCase.execute({ data, dataLog: 'test' });

			expect(mockRolRepository.findOne).toHaveBeenCalled();
			expect(mockRolRepository.update).toHaveBeenCalled();
			expect(result).toEqual({ msg: expect.any(String) });
		});
	});
});

describe('RemoveRolUseCase', () => {
	let useCase: RemoveRolUseCase;
	let mockRolRepository: any;
	let mockUserRepository: any;

	beforeEach(() => {
		mockRolRepository = {
			findOne: vi.fn().mockResolvedValue({ uid: '123', name: 'admin' }),
			remove: vi.fn().mockResolvedValue(true),
		};
		mockUserRepository = {
			findOne: vi.fn().mockResolvedValue(null),
		};

		useCase = new RemoveRolUseCase(mockRolRepository, mockUserRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should remove role successfully', async () => {
			const result = await useCase.execute({ uid: '123', dataLog: 'test' });

			expect(mockRolRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockRolRepository.remove).toHaveBeenCalledWith('123');
			expect(result).toEqual({ msg: expect.any(String) });
		});
	});
});

describe('FindAllRolsUseCase', () => {
	let useCase: FindAllRolsUseCase;
	let mockRolRepository: any;
	let mockCacheService: any;

	beforeEach(() => {
		mockRolRepository = {
			findAll: vi.fn().mockResolvedValue([{ uid: '1', name: 'admin' }]),
		};

		mockCacheService = {
			buildRoleListKey: vi.fn().mockReturnValue('cache:role:all'),
			get: vi.fn().mockResolvedValue(undefined),
			set: vi.fn().mockResolvedValue(undefined),
		};

		useCase = new FindAllRolsUseCase(mockRolRepository, mockCacheService);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should return all roles', async () => {
			const result = await useCase.execute({ dataLog: 'test' });

			expect(mockRolRepository.findAll).toHaveBeenCalled();
			expect(mockCacheService.get).toHaveBeenCalledWith('cache:role:all');
			expect(mockCacheService.set).toHaveBeenCalled();
			expect(result).toHaveLength(1);
		});
	});
});
