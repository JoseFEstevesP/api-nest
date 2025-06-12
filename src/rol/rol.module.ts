import { SharedServicesModule } from '@/shared/SharedServices.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './entities/rol.entity';
import { RolController } from './rol.controller';
import { RolService } from './rol.service';

@Module({
	imports: [SequelizeModule.forFeature([Role]), SharedServicesModule],
	controllers: [RolController],
	providers: [RolService],
	exports: [RolService, SequelizeModule.forFeature([Role])],
})
export class RolModule {}
