import { globalMsg } from '@/globalMsg';
import { ApiExtraModels } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsNotEmpty,
	IsString,
	Length,
	Matches,
} from 'class-validator';
import { msg } from '../msg';

@ApiExtraModels()
export class UserActivateCountDTO {
	@IsString({ message: globalMsg.dto.stringValue })
	@IsNotEmpty({ message: globalMsg.dto.empty })
	@Length(13, 16, { message: msg.validation.dto.code.length })
	@IsDefined({ message: globalMsg.dto.defined })
	@Matches(/^\d+$/, { message: msg.validation.dto.code.invalidCharacters })
	@Transform(({ value }) => value.trim())
	readonly code: string;
}
