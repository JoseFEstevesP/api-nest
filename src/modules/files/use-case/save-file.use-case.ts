import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SaveFileUseCase {
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

	async execute(
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
}
