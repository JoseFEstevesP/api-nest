import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'uploads/images'),
			serveRoot: '/images',
		}),
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'uploads/documents'),
			serveRoot: '/documents',
		}),
	],
	controllers: [FilesController],
	providers: [FilesService],
})
export class FilesModule {}
