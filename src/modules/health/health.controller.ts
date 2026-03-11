import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import {
	HealthCheck,
	HealthCheckService,
	SequelizeHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: SequelizeHealthIndicator,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	@Get()
	@HealthCheck()
	async check() {
		return this.health.check([
			() => this.db.pingCheck('sequelize'),
			async () => {
				try {
					const testKey = 'health-check-redis';
					const testValue = 'ok';
					await this.cacheManager.set(testKey, testValue, 1000); // Set with a short TTL
					const retrievedValue = await this.cacheManager.get(testKey);
					if (retrievedValue === testValue) {
						return { redis: { status: 'up' } };
					}
					throw new Error('Redis check failed: value mismatch');
				} catch (e) {
					throw new Error(`Redis check failed: ${e.message}`);
				}
			},
		]);
	}
}
