import * as fs from 'fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FilesService } from './files.service';
vi.mock('fs');
vi.mock('fs/promises');

describe('FilesService', () => {
	let service: FilesService;
	let mockFs: any;
	const mockFile: Express.Multer.File = {
		fieldname: 'file',
		originalname: 'test.jpg',
		encoding: '7bit',
		mimetype: 'image/jpeg',
		buffer: Buffer.from('test file content'),
		size: 1024,
		destination: '',
		filename: '',
		path: '',
		stream: null as any,
	};

	beforeEach(() => {
		mockFs = {
			existsSync: vi.fn(),
			mkdirSync: vi.fn(),
			promises: {
				writeFile: vi.fn(),
				unlink: vi.fn(),
			},
		};
		vi.mocked(fs.existsSync).mockImplementation(mockFs.existsSync);
		vi.mocked(fs.mkdirSync).mockImplementation(mockFs.mkdirSync);
		vi.mocked(fs.promises.writeFile).mockImplementation(
			mockFs.promises.writeFile,
		);
		vi.mocked(fs.promises.unlink).mockImplementation(mockFs.promises.unlink);
		Object.defineProperty(global, 'crypto', {
			value: { randomUUID: vi.fn().mockReturnValue('test-uuid') },
			writable: true,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('constructor', () => {
		it('debería crear directorios si no existen', () => {
			mockFs.existsSync.mockReturnValue(false);
			service = new FilesService();
			expect(mockFs.existsSync).toHaveBeenCalledTimes(2);
			expect(mockFs.mkdirSync).toHaveBeenCalledTimes(2);
		});

		it('no debería crear directorios si ya existen', () => {
			mockFs.existsSync.mockReturnValue(true);
			service = new FilesService();
			expect(mockFs.existsSync).toHaveBeenCalledTimes(2);
			expect(mockFs.mkdirSync).not.toHaveBeenCalled();
		});
	});

	describe('saveFile', () => {
		beforeEach(() => {
			mockFs.existsSync.mockReturnValue(true);
			service = new FilesService();
		});

		it('debería guardar archivo de imagen exitosamente', async () => {
			mockFs.promises.writeFile.mockResolvedValue(undefined);
			const result = await service.saveFile(mockFile, 'image');
			expect(result).toBe('test-uuid.jpg');
			expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
				expect.stringContaining('test-uuid.jpg'),
				mockFile.buffer,
			);
		});

		it('debería guardar archivo de documento exitosamente', async () => {
			const docFile = { ...mockFile, originalname: 'test.pdf' };
			mockFs.promises.writeFile.mockResolvedValue(undefined);
			const result = await service.saveFile(docFile, 'document');
			expect(result).toBe('test-uuid.pdf');
			expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
				expect.stringContaining('test-uuid.pdf'),
				docFile.buffer,
			);
		});

		it('debería manejar archivo sin extensión', async () => {
			const fileNoExt = { ...mockFile, originalname: 'test' };
			mockFs.promises.writeFile.mockResolvedValue(undefined);
			const result = await service.saveFile(fileNoExt, 'image');
			expect(result).toBe('test-uuid');
			expect(mockFs.promises.writeFile).toHaveBeenCalled();
		});

		it('debería lanzar error si writeFile falla', async () => {
			mockFs.promises.writeFile.mockRejectedValue(new Error('Write error'));
			await expect(service.saveFile(mockFile, 'image')).rejects.toThrow(
				'Write error',
			);
		});
	});

	describe('deleteFile', () => {
		beforeEach(() => {
			mockFs.existsSync.mockReturnValue(true);
			service = new FilesService();
		});

		it('debería eliminar archivo de imagen si existe', async () => {
			mockFs.existsSync.mockReturnValue(true);
			mockFs.promises.unlink.mockResolvedValue(undefined);
			await service.deleteFile('test.jpg', 'image');
			expect(mockFs.promises.unlink).toHaveBeenCalledWith(
				expect.stringContaining('test.jpg'),
			);
		});

		it('debería eliminar archivo de documento si existe', async () => {
			mockFs.existsSync.mockReturnValue(true);
			mockFs.promises.unlink.mockResolvedValue(undefined);
			await service.deleteFile('test.pdf', 'document');
			expect(mockFs.promises.unlink).toHaveBeenCalledWith(
				expect.stringContaining('test.pdf'),
			);
		});

		it('no debería eliminar archivo si no existe', async () => {
			mockFs.existsSync.mockReturnValue(false);
			await service.deleteFile('nonexistent.jpg', 'image');
			expect(mockFs.promises.unlink).not.toHaveBeenCalled();
		});

		it('debería manejar error de unlink correctamente', async () => {
			mockFs.existsSync.mockReturnValue(true);
			mockFs.promises.unlink.mockRejectedValue(new Error('Unlink error'));
			await expect(service.deleteFile('test.jpg', 'image')).rejects.toThrow(
				'Unlink error',
			);
		});
	});

	describe('directory paths', () => {
		beforeEach(() => {
			mockFs.existsSync.mockReturnValue(true);
			service = new FilesService();
		});

		it('debería usar ruta correcta de directorio de imágenes', async () => {
			mockFs.promises.writeFile.mockResolvedValue(undefined);
			await service.saveFile(mockFile, 'image');
			expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
				expect.stringContaining('uploads'),
				expect.any(Buffer),
			);
		});

		it('debería usar ruta correcta de directorio de documentos', async () => {
			mockFs.promises.writeFile.mockResolvedValue(undefined);
			await service.saveFile(mockFile, 'document');
			expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
				expect.stringContaining('uploads'),
				expect.any(Buffer),
			);
		});
	});
});
