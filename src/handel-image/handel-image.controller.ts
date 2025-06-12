import { ReqUidDTO } from '@/dto/ReqUid.dto';
import {
	Body,
	Controller,
	Get,
	Logger,
	Param,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { handelImageMsg } from './handel-image.msg';
import { HandelImageService } from './handel-image.service';
import { Data } from './handel-imageTypes';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('image')
@ApiTags('HandelImage')
export class HandelImageController {
	private readonly logger = new Logger(HandelImageController.name);
	constructor(private readonly handelImageService: HandelImageService) {}

	@UseInterceptors(FileInterceptor('file', multerConfig))
	@Post()
	async create(
		@UploadedFile() file: Express.Multer.File,
		@Body() data: Data,
		@Req() req: ReqUidDTO,
	) {
		const { dataLog } = req.user;
		this.logger.log(`${dataLog} - ${handelImageMsg.log.controller.create}`);

		return await this.handelImageService.create({ ...data, file });
	}

	@Get(':name')
	async getImg(@Param('name') name: string, @Res() res: Response) {
		const img = await this.handelImageService.getImage(name);
		return res.sendFile(img, { root: 'uploads' });
	}
}
