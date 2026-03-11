import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SaveFileUseCase } from '@/modules/files/use-case/saveFile.use-case';
import { DeleteFileUseCase } from '@/modules/files/use-case/deleteFile.use-case';
import * as fs from 'fs';
import * as path from 'path';

// Mock del módulo fs
jest.mock('fs', () => ({
	...jest.requireActual('fs'),
	existsSync: jest.fn(),
	mkdirSync: jest.fn(),
	promises: {
		writeFile: jest.fn(),
		unlink: jest.fn(),
	},
}));

describe('Files Use Cases', () => {
	let saveFileUseCase: SaveFileUseCase;
	let deleteFileUseCase: DeleteFileUseCase;

	const mockFile: Express.Multer.File = {
		fieldname: 'file',
		originalname: 'test-image.jpg',
		encoding: '7bit',
		mimetype: 'image/jpeg',
		buffer: Buffer.from('test file content'),
		size: 1024,
		destination: '/tmp',
		filename: 'test-image.jpg',
		path: '/tmp/test-image.jpg',
		stream: {} as any,
	};

	beforeEach(async () => {
		// Reset mocks
		jest.clearAllMocks();

		// Setup fs mocks
		(fs.existsSync as jest.Mock).mockReturnValue(false);
		(fs.mkdirSync as jest.Mock).mockImplementation(() => {});
		(fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);
		(fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

		const module: TestingModule = await Test.createTestingModule({
			providers: [SaveFileUseCase, DeleteFileUseCase],
		}).compile();

		saveFileUseCase = module.get<SaveFileUseCase>(SaveFileUseCase);
		deleteFileUseCase = module.get<DeleteFileUseCase>(DeleteFileUseCase);
	});

	describe('SaveFileUseCase', () => {
		it('should save an image file successfully', async () => {
			const result = await saveFileUseCase.execute(mockFile, 'image');

			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
			expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/);
			expect(fs.promises.writeFile).toHaveBeenCalled();
		});

		it('should save a document file successfully', async () => {
			const pdfFile: Express.Multer.File = {
				...mockFile,
				originalname: 'test-document.pdf',
				mimetype: 'application/pdf',
			};

			const result = await saveFileUseCase.execute(pdfFile, 'document');

			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
			expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/);
			expect(fs.promises.writeFile).toHaveBeenCalled();
		});

		it('should throw BadRequestException when file is not provided', async () => {
			await expect(
				saveFileUseCase.execute(null as any, 'image'),
			).rejects.toThrow(BadRequestException);
			await expect(
				saveFileUseCase.execute(null as any, 'image'),
			).rejects.toThrow('El archivo es obligatorio.');
		});

		it('should throw BadRequestException when type is invalid', async () => {
			await expect(
				saveFileUseCase.execute(mockFile, 'invalid' as any),
			).rejects.toThrow(BadRequestException);
			await expect(
				saveFileUseCase.execute(mockFile, 'invalid' as any),
			).rejects.toThrow('El tipo es obligatorio.');
		});

		it('should throw BadRequestException when image mimetype is not allowed', async () => {
			const invalidFile: Express.Multer.File = {
				...mockFile,
				mimetype: 'image/bmp', // Not in allowed list
			};

			await expect(
				saveFileUseCase.execute(invalidFile, 'image'),
			).rejects.toThrow(BadRequestException);
			await expect(
				saveFileUseCase.execute(invalidFile, 'image'),
			).rejects.toThrow('Tipo de archivo inválido.');
		});

		it('should throw BadRequestException when document mimetype is not allowed', async () => {
			const invalidFile: Express.Multer.File = {
				...mockFile,
				originalname: 'test.txt',
				mimetype: 'text/plain',
			};

			await expect(
				saveFileUseCase.execute(invalidFile, 'document'),
			).rejects.toThrow(BadRequestException);
			await expect(
				saveFileUseCase.execute(invalidFile, 'document'),
			).rejects.toThrow('Tipo de archivo inválido.');
		});

		it('should accept valid image mimetypes', async () => {
			const validMimeTypes = [
				'image/jpeg',
				'image/png',
				'image/gif',
				'image/webp',
			];

			for (const mimetype of validMimeTypes) {
				const file: Express.Multer.File = {
					...mockFile,
					mimetype,
				};

				await expect(
					saveFileUseCase.execute(file, 'image'),
				).resolves.not.toThrow();
			}
		});

		it('should accept valid document mimetypes', async () => {
			const validMimeTypes = [
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			];

			for (const mimetype of validMimeTypes) {
				const file: Express.Multer.File = {
					...mockFile,
					originalname: `test.${mimetype.split('/')[1]}`,
					mimetype,
				};

				await expect(
					saveFileUseCase.execute(file, 'document'),
				).resolves.not.toThrow();
			}
		});

		it('should throw BadRequestException when writeFile fails', async () => {
			(fs.promises.writeFile as jest.Mock).mockRejectedValue(
				new Error('Disk full'),
			);

			await expect(
				saveFileUseCase.execute(mockFile, 'image'),
			).rejects.toThrow(BadRequestException);
			await expect(
				saveFileUseCase.execute(mockFile, 'image'),
			).rejects.toThrow('Failed to save file: Disk full');
		});

		it('should create directories if they do not exist', () => {
			// Directories are created in constructor
			// Called 4 times total: 2 for SaveFileUseCase + 2 for DeleteFileUseCase
			expect(fs.mkdirSync).toHaveBeenCalledTimes(4);
			expect(fs.mkdirSync).toHaveBeenCalledWith(
				expect.stringContaining('uploads/images'),
				{ recursive: true },
			);
			expect(fs.mkdirSync).toHaveBeenCalledWith(
				expect.stringContaining('uploads/documents'),
				{ recursive: true },
			);
		});
	});

	describe('DeleteFileUseCase', () => {
		it('should delete an image file successfully', async () => {
			(fs.existsSync as jest.Mock).mockReturnValue(true);

			await expect(
				deleteFileUseCase.execute('test-image.jpg', 'image'),
			).resolves.not.toThrow();

			expect(fs.promises.unlink).toHaveBeenCalled();
			expect(fs.promises.unlink).toHaveBeenCalledWith(
				expect.stringContaining('uploads/images/test-image.jpg'),
			);
		});

		it('should delete a document file successfully', async () => {
			(fs.existsSync as jest.Mock).mockReturnValue(true);

			await expect(
				deleteFileUseCase.execute('test-document.pdf', 'document'),
			).resolves.not.toThrow();

			expect(fs.promises.unlink).toHaveBeenCalled();
			expect(fs.promises.unlink).toHaveBeenCalledWith(
				expect.stringContaining('uploads/documents/test-document.pdf'),
			);
		});

		it('should throw BadRequestException when filename is not provided', async () => {
			await expect(
				deleteFileUseCase.execute('', 'image'),
			).rejects.toThrow(BadRequestException);
			await expect(
				deleteFileUseCase.execute('', 'image'),
			).rejects.toThrow('El nombre del archivo es obligatorio.');
		});

		it('should throw BadRequestException when type is not provided', async () => {
			await expect(
				deleteFileUseCase.execute('test.jpg', '' as any),
			).rejects.toThrow(BadRequestException);
			await expect(
				deleteFileUseCase.execute('test.jpg', '' as any),
			).rejects.toThrow('El tipo es obligatorio.');
		});

		it('should throw BadRequestException when file does not exist', async () => {
			(fs.existsSync as jest.Mock).mockReturnValue(false);

			// Note: The use case wraps the not found error in a BadRequestException
			await expect(
				deleteFileUseCase.execute('non-existent.jpg', 'image'),
			).rejects.toThrow(BadRequestException);
			await expect(
				deleteFileUseCase.execute('non-existent.jpg', 'image'),
			).rejects.toThrow('Failed to delete file: Archivo no encontrado.');
		});

		it('should throw BadRequestException when unlink fails', async () => {
			(fs.existsSync as jest.Mock).mockReturnValue(true);
			(fs.promises.unlink as jest.Mock).mockRejectedValue(
				new Error('Permission denied'),
			);

			await expect(
				deleteFileUseCase.execute('test.jpg', 'image'),
			).rejects.toThrow(BadRequestException);
			await expect(
				deleteFileUseCase.execute('test.jpg', 'image'),
			).rejects.toThrow('Failed to delete file: Permission denied');
		});

		it('should create directories if they do not exist', () => {
			// Directories are created in constructor for both use cases
			// Called 4 times total: 2 for SaveFileUseCase + 2 for DeleteFileUseCase
			expect(fs.mkdirSync).toHaveBeenCalledTimes(4);
			expect(fs.mkdirSync).toHaveBeenCalledWith(
				expect.stringContaining('uploads/images'),
				{ recursive: true },
			);
			expect(fs.mkdirSync).toHaveBeenCalledWith(
				expect.stringContaining('uploads/documents'),
				{ recursive: true },
			);
		});
	});
});
