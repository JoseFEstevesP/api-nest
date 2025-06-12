import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { Data } from './handel-imageTypes';

@Injectable()
export class HandelImageService {
	private readonly imageDir = 'uploads';

	constructor() {
		if (!fs.existsSync(this.imageDir)) {
			fs.mkdirSync(this.imageDir, { recursive: true });
		}
	}

	async create(data: Data): Promise<string> {
		// Usar el nombre real del archivo subido por Multer (incluye extensión)
		const originalFilePath = path.join(this.imageDir, data.file.filename);
		const webpFilename = `${crypto.randomUUID()}_${data.ci}_${data.nameFile}.webp`;
		const webpPath = path.join(this.imageDir, webpFilename);

		// Convertir a WebP
		await sharp(originalFilePath)
			.toFormat('webp')
			.webp({ quality: 85 })
			.toFile(webpPath);

		// Eliminar el archivo original (ej: .jpg, .png)
		await fs.promises.unlink(originalFilePath);

		return webpFilename;
	}

	async getImage(imageName) {
		const filePath = path.join(this.imageDir, imageName);

		if (fs.existsSync(`${filePath}.webp`)) {
			return `${imageName}.webp`;
		} else if (fs.existsSync(filePath)) {
			return imageName;
		} else {
			return null;
		}
	}

	async removeImage(imageName: string) {
		const filePath = path.join(this.imageDir, imageName);

		if (fs.existsSync(`${filePath}.webp`)) {
			await fs.promises.unlink(`${filePath}.webp`);
		}
	}

	async getCompressedImage(imageName: string): Promise<Buffer | null> {
		const imagePath = path.join(this.imageDir, imageName);

		try {
			if (!fs.existsSync(imagePath)) {
				return null;
			}

			const compressedImageBuffer = await sharp(imagePath)
				.webp({ quality: 80 })
				.toBuffer();

			return compressedImageBuffer;
		} catch (error) {
			console.error(`Error compressing image ${imageName}: ${error.message}`);
			return null;
		}
	}
}
