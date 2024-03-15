import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { queryDTO } from 'src/dto/query.dto';
import { OrderUserProperty } from '../constant/orderProperty';

export class UserGetAllDTO extends PartialType(queryDTO) {
  @IsOptional()
  @IsEnum(OrderUserProperty, {
    message: 'La propiedad de orden no es válida',
  })
  readonly orderProperty: OrderUserProperty;
}
