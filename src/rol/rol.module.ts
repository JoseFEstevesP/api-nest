import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rol } from './entities/rol.entity';
import { RolController } from './rol.controller';
import { RolService } from './rol.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Rol]),
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [RolController],
  providers: [RolService],
})
export class RolModule {}
