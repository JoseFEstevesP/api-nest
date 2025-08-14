import { UserModule } from '@/modules/security/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './entities/rol.entity';
import { RolRepository } from './repository/rol.repository';
import { RolController } from './rol.controller';
import { CreateRolUseCase } from './use-case/createRol.use-case';
import { FindAllRolsPaginationUseCase } from './use-case/findAllRolsPagination.use-case';
import { FindAllRolsUseCase } from './use-case/findAllRols.use-case';
import { FindOneRolUseCase } from './use-case/findOneRol.use-case';
import { FindRolPermissionsUseCase } from './use-case/findRolPermissions.use-case';
import { RemoveRolUseCase } from './use-case/removeRol.use-case';
import { UpdateRolUseCase } from './use-case/updateRol.use-case';

@Module({
	imports: [
		CacheModule.register(),
		SequelizeModule.forFeature([Role]),
		forwardRef(() => UserModule),
	],
	controllers: [RolController],
	providers: [
		RolRepository,
		CreateRolUseCase,
		FindOneRolUseCase,
		FindAllRolsPaginationUseCase,
		FindAllRolsUseCase,
		UpdateRolUseCase,
		RemoveRolUseCase,
		FindRolPermissionsUseCase,
	],
	exports: [FindOneRolUseCase, FindAllRolsUseCase],
})
export class RolModule {}
