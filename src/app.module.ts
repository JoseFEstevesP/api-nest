import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import './config/env';
import { RolModule } from './rol/rol.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      uri: process.env.DB_URL,
      autoLoadModels: true,
      synchronize: true,
    }),
    UserModule,
    RolModule,
  ],
})
export class AppModule {}
