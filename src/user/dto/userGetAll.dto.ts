import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { queryDTO } from 'src/dto/query.dto';
import { OrderUserProperty } from '../constant/orderProperty';

export class UserGetAllDTO extends PartialType(queryDTO) {
  @IsEnum(OrderUserProperty, {
    message: 'La propiedad de orden no es válida',
  })
  @IsOptional()
  readonly orderProperty?: OrderUserProperty;

  @IsString({ message: 'La búsqueda debe ser de tipo string' })
  @IsOptional()
  readonly search?: string;
}
