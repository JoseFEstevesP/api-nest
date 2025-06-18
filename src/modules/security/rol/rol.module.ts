import { UserModule } from '@/modules/security/user/user.module';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './entities/rol.entity';
import { RolController } from './rol.controller';
import { RolService } from './rol.service';

@Module({
	imports: [SequelizeModule.forFeature([Role]), forwardRef(() => UserModule)],
	controllers: [RolController],
	providers: [RolService],
	exports: [RolService, SequelizeModule.forFeature([Role])],
})
export class RolModule {}
