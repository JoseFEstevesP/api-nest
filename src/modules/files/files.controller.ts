import { throwHttpExceptionProperties } from '@/functions/throwHttpException';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	HttpStatus,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SaveFileUseCase } from './use-case/save-file.use-case';
import { DeleteFileUseCase } from './use-case/delete-file.use-case';

@Controller('files')
export class FilesController {
	constructor(
		private readonly saveFileUseCase: SaveFileUseCase,
		private readonly deleteFileUseCase: DeleteFileUseCase,
	) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Body('type') type: 'image' | 'document',
	) {
		if (!file || !type) {
			throwHttpExceptionProperties(
				{ file: { message: 'El archivo y el tipo son obligatorios' } },
				HttpStatus.BAD_REQUEST,
			);
		}
		const filename = await this.saveFileUseCase.execute(file, type);
		return { filename };
	}

	@Delete('delete')
	async deleteFile(
		@Query('filename') filename: string,
		@Query('type') type: 'image' | 'document',
	) {
		if (!filename || !type) {
			throw new BadRequestException('Filename and type are required');
		}
		await this.deleteFileUseCase.execute(filename, type);
		return { deleted: true };
	}
}
