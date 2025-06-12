import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHandelImageDto {
	@IsNotEmpty()
	@IsString()
	file: string;
}
