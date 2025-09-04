import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
	imports: [TerminusModule, SequelizeModule],
	controllers: [HealthController],
})
export class HealthModule {}
