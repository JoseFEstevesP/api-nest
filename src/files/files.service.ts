import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
	private readonly imagesDir = path.join(process.cwd(), 'uploads/images');
	private readonly documentsDir = path.join(process.cwd(), 'uploads/documents');

	constructor() {
		if (!fs.existsSync(this.imagesDir)) {
			fs.mkdirSync(this.imagesDir, { recursive: true });
		}
		if (!fs.existsSync(this.documentsDir)) {
			fs.mkdirSync(this.documentsDir, { recursive: true });
		}
	}

	async saveFile(
		file: Express.Multer.File,
		type: 'image' | 'document',
	): Promise<string> {
		const dir = type === 'image' ? this.imagesDir : this.documentsDir;
		const ext = path.extname(file.originalname);
		const filename = `${crypto.randomUUID()}${ext}`;
		const filePath = path.join(dir, filename);
		await fs.promises.writeFile(filePath, file.buffer);
		return filename;
	}

	async deleteFile(
		filename: string,
		type: 'image' | 'document',
	): Promise<void> {
		const dir = type === 'image' ? this.imagesDir : this.documentsDir;
		const filePath = path.join(dir, filename);
		if (fs.existsSync(filePath)) {
			await fs.promises.unlink(filePath);
		}
	}
}
