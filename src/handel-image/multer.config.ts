import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterOptions = {
	storage: diskStorage({
		destination: './uploads',
		filename: (req, file, cb) => {
			const randomName = Array(32)
				.fill(null)
				.map(() => Math.round(Math.random() * 16).toString(16))
				.join('');
			return cb(null, `${randomName}${extname(file.originalname)}`);
		},
	}),
	limits: {
		fileSize: 1024 * 1024 * 5, // 5 MB
	},
};
