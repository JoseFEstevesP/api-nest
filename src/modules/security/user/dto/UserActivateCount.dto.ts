import { ApiExtraModels } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDefined,
	IsNotEmpty,
	IsString,
	Length,
	Matches,
} from 'class-validator';
import { userMessages } from '../user.messages';

@ApiExtraModels()
export class UserActivateCountDTO {
	@IsString({ message: userMessages.dto.stringValue })
	@IsNotEmpty({ message: userMessages.dto.empty })
	@Length(13, 16, { message: userMessages.validation.dto.code.length })
	@IsDefined({ message: userMessages.dto.defined })
	@Matches(/^\d+$/, { message: userMessages.validation.dto.code.invalidCharacters })
	@Transform(({ value }) => value.trim())
	readonly code: string;
}
