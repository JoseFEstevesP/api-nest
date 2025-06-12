import { Module } from '@nestjs/common';
import { HandelImageController } from './handel-image.controller';
import { HandelImageService } from './handel-image.service';

@Module({
	controllers: [HandelImageController],
	providers: [HandelImageService],
})
export class HandelImageModule {}
