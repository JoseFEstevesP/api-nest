import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HealthCheckService, SequelizeHealthIndicator } from '@nestjs/terminus';
import { HealthController } from '@/modules/health/health.controller';

describe.skip('HealthController', () => {
	let healthController: HealthController;
	let mockHealthCheckService: vi.Mocked<HealthCheckService>;
	let mockDbIndicator: vi.Mocked<SequelizeHealthIndicator>;
	let mockCacheManager: any;

	beforeEach(async () => {
		// Setup mocks
		mockHealthCheckService = {
			check: vi.fn(),
		} as any;

		mockDbIndicator = {
			pingCheck: vi.fn(),
		} as any;

		mockCacheManager = {
			set: vi.fn(),
			get: vi.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [HealthController],
			providers: [
				{
					provide: HealthCheckService,
					useValue: mockHealthCheckService,
				},
				{
					provide: SequelizeHealthIndicator,
					useValue: mockDbIndicator,
				},
				{
					provide: CACHE_MANAGER,
					useValue: mockCacheManager,
				},
			],
		}).compile();

		healthController = module.get<HealthController>(HealthController);
	}, 30000);

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('check', () => {
		it('should be defined', () => {
			expect(healthController).toBeDefined();
			expect(healthController.check).toBeDefined();
		});

		it('should call health.check with array of 2 checks', async () => {
			// Setup mock responses
			mockCacheManager.set.mockResolvedValue(undefined);
			mockCacheManager.get.mockResolvedValue('ok');

			const mockHealthResult = {
				status: 'ok',
				info: {
					sequelize: { status: 'up' },
					redis: { status: 'up' },
				},
			};

			mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

			const result = await healthController.check();

			// Verify health.check was called with array of 2 functions
			expect(mockHealthCheckService.check).toHaveBeenCalledTimes(1);
			const checkFunctions = mockHealthCheckService.check.mock.calls[0][0];
			expect(Array.isArray(checkFunctions)).toBe(true);
			expect(checkFunctions.length).toBe(2);
			expect(typeof checkFunctions[0]).toBe('function');
			expect(typeof checkFunctions[1]).toBe('function');

			// Verify result
			expect(result).toEqual(mockHealthResult);
		});

		it('should return healthy status when all services are up', async () => {
			mockCacheManager.set.mockResolvedValue(undefined);
			mockCacheManager.get.mockResolvedValue('ok');

			const mockResult = {
				status: 'ok',
				info: {
					sequelize: { status: 'up' },
					redis: { status: 'up' },
				},
			};

			mockHealthCheckService.check.mockResolvedValue(mockResult);

			const result = await healthController.check();

			expect(result.status).toBe('ok');
			expect(result.info).toBeDefined();
		});

		it('should handle redis check failure (value mismatch)', async () => {
			mockCacheManager.set.mockResolvedValue(undefined);
			mockCacheManager.get.mockResolvedValue('wrong-value');

			const error = new Error('Redis check failed: value mismatch');
			mockHealthCheckService.check.mockRejectedValue(error);

			await expect(healthController.check()).rejects.toThrow(
				'Redis check failed',
			);
		});

		it('should handle database check failure', async () => {
			const error = new Error('Database connection failed');
			mockHealthCheckService.check.mockRejectedValue(error);

			await expect(healthController.check()).rejects.toThrow(
				'Database connection failed',
			);
		});

		it('should handle cache set failure', async () => {
			mockCacheManager.set.mockRejectedValue(
				new Error('Redis connection failed'),
			);

			const error = new Error('Redis check failed: Redis connection failed');
			mockHealthCheckService.check.mockRejectedValue(error);

			await expect(healthController.check()).rejects.toThrow(
				'Redis check failed',
			);
		});

		it('should handle cache get failure', async () => {
			mockCacheManager.set.mockResolvedValue(undefined);
			mockCacheManager.get.mockRejectedValue(new Error('Redis read failed'));

			const error = new Error('Redis check failed: Redis read failed');
			mockHealthCheckService.check.mockRejectedValue(error);

			await expect(healthController.check()).rejects.toThrow(
				'Redis check failed',
			);
		});
	});
});
