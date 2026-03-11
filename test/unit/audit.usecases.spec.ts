import { UpdateAuditUseCase } from '@/modules/security/audit/use-case/updateAudit.use-case';
import { RemoveAuditUseCase } from '@/modules/security/audit/use-case/removeAudit.use-case';
import { FindOneAuditUseCase } from '@/modules/security/audit/use-case/findOneAudit.use-case';
import { AuditRepository } from '@/modules/security/audit/repository/audit.repository';

describe('UpdateAuditUseCase', () => {
	let useCase: UpdateAuditUseCase;
	let mockAuditRepository: any;

	beforeEach(() => {
		mockAuditRepository = {
			findOne: vi.fn().mockResolvedValue({ uid: '123' }),
			update: vi.fn().mockResolvedValue([1]),
		};

		useCase = new UpdateAuditUseCase(mockAuditRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should update audit successfully', async () => {
			const data = { uid: '123', refreshToken: 'newtoken' };

			const result = await useCase.execute({ data });

			expect(mockAuditRepository.findOne).toHaveBeenCalled();
			expect(mockAuditRepository.update).toHaveBeenCalled();
			expect(result).toEqual({ msg: expect.any(String) });
		});
	});
});

describe('RemoveAuditUseCase', () => {
	let useCase: RemoveAuditUseCase;
	let mockAuditRepository: any;

	beforeEach(() => {
		mockAuditRepository = {
			findOne: vi.fn().mockResolvedValue({ uid: '123' }),
			remove: vi.fn().mockResolvedValue(true),
		};

		useCase = new RemoveAuditUseCase(mockAuditRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should remove audit successfully', async () => {
			const result = await useCase.execute({ where: { uid: '123' } }, 'test');

			expect(mockAuditRepository.findOne).toHaveBeenCalled();
			expect(mockAuditRepository.remove).toHaveBeenCalledWith('123');
			expect(result).toEqual({ msg: expect.any(String) });
		});
	});
});

describe('FindOneAuditUseCase', () => {
	let useCase: FindOneAuditUseCase;
	let mockAuditRepository: any;

	beforeEach(() => {
		mockAuditRepository = {
			findOne: vi.fn().mockResolvedValue({ uid: '123', uidUser: 'user1' }),
		};

		useCase = new FindOneAuditUseCase(mockAuditRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('execute', () => {
		it('should return audit when found', async () => {
			const result = await useCase.execute({
				refreshToken: 'token123',
				dataToken: [],
			});

			expect(mockAuditRepository.findOne).toHaveBeenCalled();
			expect(result).toBeDefined();
		});
	});
});
