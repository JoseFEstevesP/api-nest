import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FilesController } from './files.controller';
import { SaveFileUseCase } from './use-case/save-file.use-case';
import { DeleteFileUseCase } from './use-case/delete-file.use-case';

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
	providers: [
		SaveFileUseCase,
		DeleteFileUseCase,
	],
})
export class FilesModule {}
