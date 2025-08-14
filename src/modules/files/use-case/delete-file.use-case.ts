import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DeleteFileUseCase {
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
